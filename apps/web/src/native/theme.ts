import { APP_THEME_KEY } from "@raven/lib/utils/nativeKeys"
import { isNative } from "./platform"

// Mirror the in-app theme into native storage: the picker and the native canvas
// cannot read the site's localStorage. "system" clears the override.
export const syncNativeTheme = (theme: "light" | "dark" | "system") => {
    if (!isNative()) return
    import("@capacitor/preferences")
        .then(({ Preferences }) => Preferences.set({ key: APP_THEME_KEY, value: theme }))
        .catch(() => { })
}
