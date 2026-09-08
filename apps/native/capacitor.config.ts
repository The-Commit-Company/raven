import type { CapacitorConfig } from "@capacitor/cli"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const config: CapacitorConfig = {
    appId: "raven.thecommit.company",
    appName: "Raven",
    webDir: "dist",
    server: {
        // The saved-site list is dynamic, so it cannot be expressed here. The
        // RavenShell plugin gates navigation instead: only saved sites (and the
        // shell) load in the WebView, everything else opens in the system browser.
        allowNavigation: ["*"],
    },
    ios: { contentInset: "never" },
    android: { allowMixedContent: false },
    plugins: {
        Keyboard: { resize: "native" },
        // Insets are applied natively in MainActivity so sites running a bundle
        // without native CSS still sit inside the system bars. No CSS variables.
        SystemBars: { insetsHandling: "disable" },
        // Android < 15: lay the page out below the status bar instead of behind it.
        StatusBar: { overlaysWebView: false },
        // The web app hides the launch splash once rendered; the native timer covers
        // sites that never do (old bundle, site down). A shell JS timer cannot: it is
        // discarded when the WebView navigates to the site.
        SplashScreen: { launchAutoHide: true, launchShowDuration: 8000 },
    },
}

// Machine-local dev overrides (plain http to a local bench). Gitignored, so
// CI and fresh checkouts never see it, and release configs keep the https-only values.
const localPath = join(__dirname, "capacitor.config.local.json")
if (existsSync(localPath)) {
    const local = JSON.parse(readFileSync(localPath, "utf8"))
    config.server = { ...config.server, ...local.server }
    config.android = { ...config.android, ...local.android }
    console.warn("[capacitor] dev overrides applied from capacitor.config.local.json")
}

export default config
