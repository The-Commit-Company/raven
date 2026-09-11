import { siteFetch, siteKey } from "@lib/site"
import { setSessionUser } from "@lib/sessionUser"

const CACHE_KEY = "raven-boot-cache"

/** The fields of Frappe's session boot this module reads; the rest passes through untouched. */
type Boot = {
    user?: { name?: string }
    user_info?: Record<string, { fullname?: string; image?: string | null }>
    __messages?: Record<string, string>
}

const install = (boot: Boot) => {
    if (!window.frappe) window.frappe = {}
    window.frappe.boot = boot
    window.frappe._messages = boot.__messages ?? {}
    const name = boot.user?.name ?? ""
    const info = boot.user_info?.[name] ?? {}
    setSessionUser({ name, fullName: info.fullname ?? name, image: info.image ?? "" })
}

/** Boot from the site, else the last good copy for this site. False when neither exists. */
export const loadBoot = async (): Promise<boolean> => {
    try {
        const res = await siteFetch("/api/method/raven.api.native.boot")
        if (!res.ok) throw new Error(String(res.status))
        const { message } = (await res.json()) as { message: Boot }
        install(message)
        try { localStorage.setItem(siteKey(CACHE_KEY), JSON.stringify(message)) } catch { /* quota */ }
        return true
    } catch {
        const cached = localStorage.getItem(siteKey(CACHE_KEY))
        if (!cached) return false
        install(JSON.parse(cached) as Boot)
        return true
    }
}
