import { versionAtLeast } from "./version"

export type Site = {
    /** Origin the site answers from, e.g. https://raven.example.com */
    url: string
    name: string
    /** Frappe site name, the socket namespace. */
    sitename: string
    clientId: string
    logo?: string
    ravenVersion: string
}

const SITES_KEY = "sites"
const DEFAULT_SITE_KEY = "defaultSite"

export const normalizeSiteUrl = (input: string): string | null => {
    const trimmed = input.trim()
    if (!trimmed) return null
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    try {
        return new URL(withScheme).origin
    } catch {
        return null
    }
}

type JsonResponse = { status: number; data: unknown; url?: string }
export type GetJson = (url: string) => Promise<JsonResponse>

// Native request: no CORS, so a site older than the CORS hook still answers,
// and the failure reads as "too old" instead of a blocked fetch.
const nativeGetJson: GetJson = async (url) => {
    const { CapacitorHttp } = await import("@capacitor/core")
    const res = await CapacitorHttp.get({ url, connectTimeout: 8000, readTimeout: 8000 })
    return { status: res.status, data: res.data, url: res.url }
}

export type ProbeResult = { site: Site } | { error: "unreachable" | "not-raven" | "site-too-old" | "app-too-old" | "no-client" }

type Handshake = { client_id?: string | null; raven_version?: string; min_app_version?: string; sitename?: string; app_name?: string; logo?: string }

export const probeSite = async (url: string, appVersion: string, getJson: GetJson = nativeGetJson): Promise<ProbeResult> => {
    let res: JsonResponse
    try {
        res = await getJson(`${url}/api/method/raven.api.native.handshake`)
    } catch {
        return { error: "unreachable" }
    }
    // 404 and 417 are Frappe's answers for a method it does not know.
    if (res.status === 404 || res.status === 417) return { error: "site-too-old" }
    const message = (res.data as { message?: Handshake } | null)?.message
    if (res.status !== 200 || !message?.sitename || !message.raven_version) return { error: "not-raven" }
    if (!versionAtLeast(appVersion, message.min_app_version ?? "0")) return { error: "app-too-old" }
    if (!message.client_id) return { error: "no-client" }
    return {
        site: {
            // The origin the site answered from (apex → www, http → https).
            url: (res.url && normalizeSiteUrl(res.url)) || url,
            name: message.app_name || "Raven",
            sitename: message.sitename,
            clientId: message.client_id,
            logo: message.logo || undefined,
            ravenVersion: message.raven_version,
        },
    }
}

// The plugin proxy must never be a promise's value: resolving it calls its `then`.
const withPrefs = <T,>(fn: (p: typeof import("@capacitor/preferences").Preferences) => Promise<T>): Promise<T> =>
    import("@capacitor/preferences").then(({ Preferences }) => fn(Preferences))

export const loadSites = async (): Promise<Site[]> => {
    const { value } = await withPrefs((p) => p.get({ key: SITES_KEY }))
    if (!value) return []
    try { return JSON.parse(value) as Site[] } catch { return [] }
}

const writeSites = (sites: Site[]) => withPrefs((p) => p.set({ key: SITES_KEY, value: JSON.stringify(sites) }))

/** Front of the list: the picker shows the last used site first. */
export const saveSite = async (site: Site) => {
    await writeSites([site, ...(await loadSites()).filter((s) => s.url !== site.url)])
}

/** Drops the list entry and the default; tokens are the session module's job. */
export const forgetSite = async (url: string) => {
    await writeSites((await loadSites()).filter((s) => s.url !== url))
    if ((await getDefaultSite()) === url) await setDefaultSite(null)
}

export const getDefaultSite = (): Promise<string | null> => withPrefs((p) => p.get({ key: DEFAULT_SITE_KEY })).then((r) => r.value)
export const setDefaultSite = (url: string | null) =>
    withPrefs((p) => (url ? p.set({ key: DEFAULT_SITE_KEY, value: url }) : p.remove({ key: DEFAULT_SITE_KEY })))
