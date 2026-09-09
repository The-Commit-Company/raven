import { codeChallengeS256, randomString } from "./pkce"

// Host segment is required: Foundation parses "scheme:?code=…" with a nil query.
export const REDIRECT_URL = "raven.thecommit.company://oauth"
const SCOPE = "all openid"
const TOKEN_ENDPOINT = "/api/method/frappe.integrations.oauth2.get_token"

export type StoredTokens = { accessToken: string; refreshToken?: string; expiresAt: number }
export type Callback = { code?: string; state?: string; error?: string; error_description?: string }

export const buildAuthorizeUrl = (site: string, clientId: string, state: string, challenge: string): string => {
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        scope: SCOPE,
        redirect_uri: REDIRECT_URL,
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
    })
    return `${site}/api/method/frappe.integrations.oauth2.authorize?${params.toString()}`
}

export const parseCallback = (url: string): Callback | null => {
    // Custom schemes do not survive URL.host parsing; match the prefix manually.
    const [base, queryPart] = url.split("#")[0].split("?")
    if (base !== REDIRECT_URL && base !== `${REDIRECT_URL}/`) return null
    if (queryPart === undefined) return {}
    const query = new URLSearchParams(queryPart)
    const callback: Callback = {}
    for (const field of ["code", "state", "error", "error_description"] as const) {
        if (query.has(field)) callback[field] = query.get(field) ?? undefined
    }
    return callback
}

const key = (site: string) => `raven.tokens.${site}`
// The plugin proxy must never be a promise's value: resolving it calls its `then`.
const withSecure = <T,>(fn: (p: typeof import("capacitor-secure-storage-plugin").SecureStoragePlugin) => Promise<T>): Promise<T> =>
    import("capacitor-secure-storage-plugin").then(({ SecureStoragePlugin }) => fn(SecureStoragePlugin))

export const tokenStore = {
    async get(site: string): Promise<StoredTokens | null> {
        try {
            const { value } = await withSecure((p) => p.get({ key: key(site) }))
            const parsed = JSON.parse(value) as StoredTokens
            if (typeof parsed?.accessToken !== "string" || typeof parsed.expiresAt !== "number") return null
            return parsed
        } catch {
            return null
        }
    },
    async set(site: string, tokens: StoredTokens) {
        await withSecure((p) => p.set({ key: key(site), value: JSON.stringify(tokens) }))
    },
    async remove(site: string) {
        await withSecure((p) => p.remove({ key: key(site) })).catch(() => { })
    },
}

type TokenResponse = { access_token?: string; refresh_token?: string; expires_in?: number; error?: string }

export type AuthDeps = {
    openBrowser: (url: string) => Promise<void>
    closeBrowser: () => Promise<void>
    onAppUrlOpen: (handler: (url: string) => void) => Promise<() => void>
    onBrowserFinished: (handler: () => void) => Promise<() => void>
    post: (url: string, form: Record<string, string>) => Promise<{ status: number; data: unknown }>
    store: typeof tokenStore
    pkce: { verifier: () => string; challenge: (v: string) => Promise<string>; state: () => string }
    now: () => number
}

export const defaultDeps: AuthDeps = {
    openBrowser: async (url) => { const { Browser } = await import("@capacitor/browser"); await Browser.open({ url }) },
    closeBrowser: async () => { const { Browser } = await import("@capacitor/browser"); await Browser.close() },
    onAppUrlOpen: async (handler) => {
        const { App } = await import("@capacitor/app")
        const handle = await App.addListener("appUrlOpen", (e) => handler(e.url))
        return () => { handle.remove().catch(() => { }) }
    },
    onBrowserFinished: async (handler) => {
        const { Browser } = await import("@capacitor/browser")
        const handle = await Browser.addListener("browserFinished", () => handler())
        return () => { handle.remove().catch(() => { }) }
    },
    // Native request: token posts need no CORS and carry no cookies.
    post: async (url, form) => {
        const { CapacitorHttp } = await import("@capacitor/core")
        const res = await CapacitorHttp.post({ url, headers: { "Content-Type": "application/x-www-form-urlencoded" }, data: form })
        return { status: res.status, data: res.data }
    },
    store: tokenStore,
    pkce: { verifier: () => randomString(32), challenge: codeChallengeS256, state: () => randomString(16) },
    now: () => Date.now(),
}

const exchange = async (site: string, form: Record<string, string>, prev: StoredTokens | null, deps: AuthDeps): Promise<StoredTokens> => {
    const res = await deps.post(`${site}${TOKEN_ENDPOINT}`, form)
    const data = res.data as TokenResponse | null
    if (res.status < 200 || res.status >= 300 || !data?.access_token) throw new Error(data?.error || "Token exchange failed")
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? prev?.refreshToken,
        expiresAt: deps.now() + (data.expires_in ?? 3600) * 1000,
    }
}

/** Waits for the redirect back from the browser, keyed by `state`. */
const awaitCallback = (state: string, deps: AuthDeps): Promise<Callback> =>
    new Promise<Callback>((resolve, reject) => {
        let settled = false
        let removeUrl = () => { }
        let removeFinished = () => { }
        const finish = (fn: () => void) => {
            if (settled) return
            settled = true
            fn()
            removeUrl()
            removeFinished()
        }
        deps.onAppUrlOpen((url) => {
            const cb = parseCallback(url)
            if (!cb) return
            // Frappe's deny redirect carries no state; anything else must carry ours.
            if (cb.error) {
                if (cb.state === state || (cb.state === undefined && cb.error === "access_denied")) finish(() => reject(new Error(cb.error_description || cb.error)))
                return
            }
            if (cb.state !== state) return
            finish(() => (cb.code ? resolve(cb) : reject(new Error("Callback carried no authorization code"))))
        }).then((remove) => { removeUrl = remove })
        deps.onBrowserFinished(() => {
            // The redirect can arrive just after the sheet closes on iOS.
            setTimeout(() => finish(() => reject(new Error("Sign-in was cancelled"))), 750)
        }).then((remove) => { removeFinished = remove })
    })

export const signIn = async (site: string, clientId: string, deps: AuthDeps = defaultDeps): Promise<StoredTokens> => {
    const verifier = deps.pkce.verifier()
    const state = deps.pkce.state()
    const challenge = await deps.pkce.challenge(verifier)
    // Listen before opening the browser: the redirect can arrive instantly.
    const pending = awaitCallback(state, deps)
    await deps.openBrowser(buildAuthorizeUrl(site, clientId, state, challenge))
    let callback: Callback
    try {
        callback = await pending
    } finally {
        await deps.closeBrowser().catch(() => { })
    }
    const tokens = await exchange(site, {
        grant_type: "authorization_code",
        code: callback.code ?? "",
        client_id: clientId,
        redirect_uri: REDIRECT_URL,
        code_verifier: verifier,
    }, null, deps)
    await deps.store.set(site, tokens)
    return tokens
}

/** Throws on failure and leaves the stored tokens as they were. */
export const refreshTokens = async (site: string, clientId: string, deps: AuthDeps = defaultDeps): Promise<StoredTokens> => {
    const prev = await deps.store.get(site)
    if (!prev?.refreshToken) throw new Error("No refresh token")
    const tokens = await exchange(site, { grant_type: "refresh_token", refresh_token: prev.refreshToken, client_id: clientId }, prev, deps)
    await deps.store.set(site, tokens)
    return tokens
}

export const signOut = async (site: string, deps: AuthDeps = defaultDeps) => {
    const tokens = await deps.store.get(site)
    await deps.store.remove(site)
    if (!tokens) return
    const revoke = (token: string, hint: string) =>
        deps.post(`${site}/api/method/frappe.integrations.oauth2.revoke_token`, { token, token_type_hint: hint }).catch(() => { })
    if (tokens.refreshToken) await revoke(tokens.refreshToken, "refresh_token")
    await revoke(tokens.accessToken, "access_token")
}
