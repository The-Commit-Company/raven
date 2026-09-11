import { refreshTokens, tokenStore, type StoredTokens } from "./auth"
import { setDefaultSite, type Site } from "./sites"

export type ActiveSession = { site: Site; getToken: () => string }

export type SessionDeps = {
    getTokens: (url: string) => Promise<StoredTokens | null>
    refresh: (url: string, clientId: string) => Promise<StoredTokens>
    now: () => number
}

const defaultDeps: SessionDeps = {
    getTokens: (url) => tokenStore.get(url),
    refresh: (url, clientId) => refreshTokens(url, clientId),
    now: () => Date.now(),
}

// Refresh this close to expiry rather than risk a 401 mid-request.
const EXPIRY_MARGIN_MS = 5 * 60_000

// Only the access token stays in memory; the refresh token is read from the keychain when needed.
type Access = Pick<StoredTokens, "accessToken" | "expiresAt">
const access = ({ accessToken, expiresAt }: StoredTokens): Access => ({ accessToken, expiresAt })

let current: { site: Site; tokens: Access; deps: SessionDeps } | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let refreshing: Promise<boolean> | null = null
let sessionLost: () => void = () => { }
let tokenRefreshed: (token: string) => void = () => { }

export const setSessionLostHandler = (fn: () => void) => { sessionLost = fn }
/** Called with the new access token after every successful refresh (the socket re-arms with it). */
export const setTokenRefreshedHandler = (fn: (token: string) => void) => { tokenRefreshed = fn }

export const activeSession = (): ActiveSession | null =>
    current ? { site: current.site, getToken: () => current!.tokens.accessToken } : null

const schedule = () => {
    clearTimeout(timer)
    if (!current) return
    const lifetime = current.tokens.expiresAt - current.deps.now()
    timer = setTimeout(() => { refreshNow() }, Math.max(0, lifetime * 0.8))
}

/** One refresh at a time; resolves false when the tokens could not be renewed. */
const refreshNow = (): Promise<boolean> => {
    if (refreshing) return refreshing
    if (!current) return Promise.resolve(false)
    const { site, deps } = current
    refreshing = deps.refresh(site.url, site.clientId)
        .then((tokens) => {
            if (current?.site.url === site.url) { current.tokens = access(tokens); schedule() }
            tokenRefreshed(tokens.accessToken)
            return true
        })
        .catch(() => false)
        .finally(() => { refreshing = null })
    return refreshing
}

export const startSession = async (site: Site, deps: SessionDeps = defaultDeps): Promise<ActiveSession | null> => {
    endSession()
    const tokens = await deps.getTokens(site.url)
    if (!tokens) return null
    current = { site, tokens: access(tokens), deps }
    if (tokens.expiresAt - deps.now() < EXPIRY_MARGIN_MS && !(await refreshNow())) {
        current = null
        return null
    }
    schedule()
    return activeSession()
}

/** Global request error hook: one refresh per 401 burst, then give up. */
export const onRequestError = (error: { httpStatus?: number }) => {
    if (error?.httpStatus !== 401 || !current) return
    refreshNow().then((ok) => {
        if (ok || !current) return
        endSession()
        sessionLost()
    })
}

export const endSession = () => {
    clearTimeout(timer)
    current = null
}

/** Back to the picker with the session kept; the reload resets every store. */
export const switchSite = async () => {
    await setDefaultSite(null)
    window.location.replace("/")
}
