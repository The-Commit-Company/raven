import { DEFAULT_SITE_KEY } from "@raven/lib/utils/nativeKeys"
import { listenNative, nativePlatform, shellOrigin } from "./platform"

// Single-segment pages that are not footer roots (App.tsx routes).
const SUBPAGES = new Set(["search", "saved-messages", "share-target"])

// Root pages of the mobile app: the footer tabs (DMs, threads, notifications,
// profile) and a workspace home, all one segment.
export const isRootPath = (pathname: string) => {
    const segments = pathname.split("/").filter(Boolean)
    return segments.length <= 1 && !SUBPAGES.has(segments[0] ?? "")
}

// Android hardware-back: back to the picker from a root page, else one step back
// in history. Decided by route only: the WebView's canGoBack flag misses the
// router's pushState entries, and the launch redirect always leaves one behind.
export const registerAndroidBack = (isRoot: () => boolean, goRoot: () => void): (() => void) => {
    if (nativePlatform() !== "android") return () => { }
    return listenNative(async () => (await import("@capacitor/app")).App.addListener("backButton", () => {
        if (isRoot()) switchSite()
        // No history on a cold-start deep link (tap, share): go to the workspace home.
        else if (window.history.length > 1) window.history.back()
        else goRoot()
    }))
}

// Open another saved site and make it the one the next launch auto-opens.
export const openOtherSite = async (url: string) => {
    await import("@capacitor/preferences").then(({ Preferences }) => Preferences.set({ key: DEFAULT_SITE_KEY, value: new URL(url).origin })).catch(() => { })
    window.location.href = url
}

// Back to the picker. Session, tokens and push stay: switching is not signing out,
// so the next open of this site is silent (refresh token → login_with_token).
export const switchSite = async () => {
    // Without a default site the shell shows the picker.
    await import("@capacitor/preferences").then(({ Preferences }) => Preferences.remove({ key: DEFAULT_SITE_KEY })).catch(() => { })
    window.location.href = `${shellOrigin()}/`
}
