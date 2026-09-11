import { StrictMode, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import type { FrappeConfig } from "frappe-react-sdk"
import { ThemeProvider } from "@components/theme-provider"
import { setActiveSite } from "@lib/site"
import { loadBoot } from "./appBoot"
import { NativeSocket } from "./nativeSocket"
import { onRequestError, setSessionLostHandler, setTokenRefreshedHandler, startSession } from "./session"
import { getDefaultSite, loadSites, setDefaultSite } from "./sites"
import { SitePicker } from "./SitePicker"
import { hideNativeSplash } from "./splash"

const render = (node: ReactNode) => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <ThemeProvider>{node}</ThemeProvider>
        </StrictMode>,
    )
    hideNativeSplash()
}

const toPicker = () => { setDefaultSite(null).finally(() => window.location.replace("/")) }

// Same rule as the sdk: the site origin, with the port swapped for a bench's socket port.
const socketUrl = (origin: string) => {
    const url = new URL(origin)
    if (import.meta.env.VITE_SOCKET_PORT) url.port = import.meta.env.VITE_SOCKET_PORT
    return url.origin
}

/** The default site with live tokens opens the app; anything else shows the picker. */
export const bootNative = async () => {
    document.documentElement.classList.add("native")
    // A dead session returns to the picker, where the site row re-logs in.
    setSessionLostHandler(toPicker)
    const url = await getDefaultSite()
    const site = url ? (await loadSites()).find((s) => s.url === url) : undefined
    const session = site ? await startSession(site) : null
    if (!session) return render(<SitePicker />)
    // Storage keys and URLs are scoped from here on; boot needs the token.
    setActiveSite(session.site.url, session.getToken)
    if (!(await loadBoot())) return toPicker()
    // Loaded only now: App's module graph reads boot and scoped storage keys at import.
    const { default: App } = await import("../App")
    const socket = new NativeSocket({ url: socketUrl(session.site.url), namespace: session.site.sitename, origin: session.site.url }, session.getToken)
    setTokenRefreshedHandler((token) => socket.setToken(token))
    socket.start().catch(() => { })
    render(<App native={{ url: session.site.url, siteName: session.site.sitename, getToken: session.getToken, onRequestError, socket: socket as unknown as FrappeConfig["socket"] }} />)
}
