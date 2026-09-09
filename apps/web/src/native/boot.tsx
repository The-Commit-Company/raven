import { StrictMode, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@components/theme-provider"
import { setSessionLostHandler, startSession } from "./session"
import { getDefaultSite, loadSites, setDefaultSite } from "./sites"
import { SessionScreen } from "./SessionScreen"
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

/** The default site with live tokens opens directly; anything else shows the picker. */
export const bootNative = async () => {
    document.documentElement.classList.add("native")
    // A dead session sends the user back to the picker, where the site row re-logs in.
    setSessionLostHandler(() => { setDefaultSite(null).finally(() => window.location.replace("/")) })
    const url = await getDefaultSite()
    const site = url ? (await loadSites()).find((s) => s.url === url) : undefined
    const session = site ? await startSession(site) : null
    render(session ? <SessionScreen session={session} /> : <SitePicker />)
}
