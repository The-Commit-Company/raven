import { callNotificationAPI } from "@lib/pushApi"
import { pushTokenKey } from "@raven/lib/utils/nativeKeys"
import { listenNative, nativePlatform } from "./platform"
import { ravenShell } from "./shell"

// localStorage key is raven- prefixed so useLogout's prefix wipe already cleans it up.
export const NATIVE_TOKEN_KEY = "raven-native-fcm-token"

export const isNativePushEnabled = () => localStorage.getItem(NATIVE_TOKEN_KEY) !== null

// Dynamic import keeps Capacitor code out of browser bundles; memoized since the import
// is one-shot anyway. The proxy is wrapped in an object: a promise resolved with the
// proxy itself never settles (its `then` goes to native).
let messagingPromise: Promise<{ fm: typeof import("@capacitor-firebase/messaging").FirebaseMessaging }> | undefined
const messaging = () =>
    (messagingPromise ??= import("@capacitor-firebase/messaging").then((m) => ({ fm: m.FirebaseMessaging })))

// Mirror of the subscribed token in shell storage, keyed by site: the shell
// unsubscribes it when the user removes this site from the picker.
const mirrorToken = async (token: string | null) => {
    const { Preferences } = await import("@capacitor/preferences")
    const key = pushTokenKey(window.location.origin)
    if (token) await Preferences.set({ key, value: token })
    else await Preferences.remove({ key })
}

// Serialised: a rotation event and getToken can report the same token together.
let syncing: Promise<void> = Promise.resolve()
const syncToken = (token: string) => (syncing = syncing.then(() => subscribeToken(token)))

const subscribeToken = async (token: string) => {
    const old = localStorage.getItem(NATIVE_TOKEN_KEY)
    if (old === token) return
    if (old) await callNotificationAPI("unsubscribe", { fcm_token: old }).catch(() => { })
    await callNotificationAPI("subscribe", {
        fcm_token: token,
        environment: "Mobile",
        device_information: `${nativePlatform()} native app`,
    })
    localStorage.setItem(NATIVE_TOKEN_KEY, token)
    await mirrorToken(token).catch(() => { })
}

export const enableNativePush = async (): Promise<boolean> => {
    const { fm } = await messaging()
    const { receive } = await fm.requestPermissions()
    if (receive !== "granted") return false
    const { token } = await fm.getToken()
    await syncToken(token)
    return true
}

export const disableNativePush = async (): Promise<void> => {
    const token = localStorage.getItem(NATIVE_TOKEN_KEY)
    if (!token) return
    localStorage.removeItem(NATIVE_TOKEN_KEY)
    await mirrorToken(null).catch(() => { })
    // Server row only: the device token is shared by every site signed in on this device.
    try { await callNotificationAPI("unsubscribe", { fcm_token: token }) } catch (e) { console.error("unsubscribe failed", e) }
}

// Same precedence as sw.js notificationclick: message_url → click_action → base_url.
export const resolveNotificationTarget = (data: Record<string, string>, currentOrigin: string) => {
    const raw = data.message_url || data.click_action || data.base_url
    if (!raw) return null
    let url: URL
    try { url = new URL(raw) } catch { return null }
    // The payload is server data; only web URLs may be assigned to location.
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    if (url.origin !== currentOrigin) return { kind: "other-site" as const, url: url.href }
    const path = url.pathname.replace(/^\/raven/, "") || "/"
    return { kind: "same-site" as const, path: path + url.search + url.hash }
}

export const subscribeNotificationTaps = (handler: (data: Record<string, string>) => void): (() => void) =>
    listenNative(async () => (await messaging()).fm.addListener("notificationActionPerformed", (e) =>
        handler((e.notification.data ?? {}) as Record<string, string>)))

// Channel id of a tray entry for the site at `hostname`. Android reports the FCM
// tag (`<host>:<channel>`); iOS reports the payload data, whose site URL is checked
// instead. Another site's entry maps to undefined, which the read sweep leaves alone.
export const trayChannelId = (tag: string | null | undefined, data: Record<string, string>, hostname: string) => {
    if (tag) return tag.startsWith(`${hostname}:`) ? tag.slice(hostname.length + 1) : undefined
    try {
        return new URL(data.base_url || data.message_url).hostname === hostname ? data.channel_id : undefined
    } catch {
        return undefined
    }
}

// Tray entries in the shape the read sweep uses.
export const getNativeDeliveredNotifications = async () => {
    const { fm } = await messaging()
    const { notifications } = await fm.getDeliveredNotifications()
    return notifications.map((n) => ({
        tag: trayChannelId(n.tag, (n.data ?? {}) as Record<string, string>, window.location.hostname),
        close: () => { fm.removeDeliveredNotifications({ notifications: [n] }).catch(() => { }) },
    }))
}

// A push that arrives while the app is in the foreground is handed to the page, not
// shown (iOS: presentationOptions []). Re-post the ones from another saved site through
// the shell; the open site's own messages arrive through realtime already.
export const subscribeForeignSiteNotifications = (): (() => void) => {
    return listenNative(async () => (await messaging()).fm.addListener("notificationReceived", async ({ notification }) => {
        const data = (notification.data ?? {}) as Record<string, string>
        const target = resolveNotificationTarget(data, window.location.origin)
        if (target?.kind !== "other-site") return
        const { shell } = await ravenShell()
        // Same tag form as the server's, so the other site's sweep can clear it.
        const tag = data.channel_id ? `${new URL(target.url).hostname}:${data.channel_id}` : undefined
        await shell.showNotification({ title: notification.title, body: notification.body, tag, data })
    }))
}

// Startup: refresh a rotated token for already-subscribed devices.
export const initNativePush = () => {
    if (!isNativePushEnabled()) return
    messaging().then(async ({ fm }) => {
        const { receive } = await fm.checkPermissions()
        if (receive === "denied") { await disableNativePush(); return }   // OS revoked: remove local and server token
        if (receive !== "granted") return                                  // "prompt" is ambiguous — keep the token, skip this refresh
        // Listen BEFORE getToken so a rotation in that window is not missed.
        await fm.addListener("tokenReceived", ({ token }) => syncToken(token).catch(() => { }))
        const { token } = await fm.getToken()
        await syncToken(token)
    }).catch((e) => console.error("Native push init failed", e))
}
