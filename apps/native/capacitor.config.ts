import type { CapacitorConfig } from "@capacitor/cli"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const config: CapacitorConfig = {
    appId: "raven.thecommit.company",
    appName: "Raven",
    // Native-mode build of apps/web (yarn native:build).
    webDir: "../web/dist-native",
    ios: { contentInset: "never" },
    android: { allowMixedContent: false },
    plugins: {
        Keyboard: { resize: "native" },
        // Insets are applied natively in MainActivity; the page gets no CSS variables.
        SystemBars: { insetsHandling: "disable" },
        // Android < 15: lay the page out below the status bar instead of behind it.
        StatusBar: { overlaysWebView: false },
        // The page hides the splash once rendered; the native timer covers a page that never does.
        SplashScreen: { launchAutoHide: true, launchShowDuration: 8000 },
        // Foreground pushes go to the page; the page re-posts the ones from other sites.
        FirebaseMessaging: { presentationOptions: [] },
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
