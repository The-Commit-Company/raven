import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@components/theme-provider"
import _ from "@lib/translate"
import { nativePlatform } from "./platform"
import { hideNativeSplash } from "./splash"

// Layer 1 placeholder; layer 2 replaces it with the site picker and session flow.
const Placeholder = () => (
    <main className="min-h-dvh bg-surface-white text-ink-gray-9 flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-semibold">Raven</h1>
        <p className="text-ink-gray-6">{_("Native shell")} · {nativePlatform()}</p>
    </main>
)

export const bootNative = () => {
    document.documentElement.classList.add("native")
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <ThemeProvider>
                <Placeholder />
            </ThemeProvider>
        </StrictMode>,
    )
    hideNativeSplash()
}
