import * as React from "react"

type Theme = "dark" | "light" | "system"

const STORAGE_KEY = "raven-theme"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
}

type ThemeProviderState = {
    /** Theme preference selected by the user - light, dark, or system. */
    theme: Theme
    setTheme: (theme: Theme) => void
    /** Resolved theme actually applied to the document (system → light/dark). */
    themeValue: "light" | "dark"
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    themeValue: "light",
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
    return theme === "system" ? getSystemTheme() : theme
}

function applyThemeToDocument(value: "light" | "dark") {
    if (typeof document === "undefined") return
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(value)
}

function getStoredTheme(defaultTheme: Theme): Theme {
    if (typeof window === "undefined") return defaultTheme
    return (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    ...props
}: ThemeProviderProps) {
    // Read the persisted preference and apply it synchronously on init so there's
    // no light-mode flash before the effect runs.
    const [theme, setThemeState] = React.useState<Theme>(() => {
        const stored = getStoredTheme(defaultTheme)
        applyThemeToDocument(resolveTheme(stored))
        return stored
    })
    const [themeValue, setThemeValue] = React.useState<"light" | "dark">(() =>
        resolveTheme(getStoredTheme(defaultTheme)),
    )

    React.useEffect(() => {
        const resolved = resolveTheme(theme)
        applyThemeToDocument(resolved)
        setThemeValue(resolved)

        // Only "system" tracks the OS; react to OS light/dark changes while open.
        if (theme !== "system") return

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => {
            const next = mediaQuery.matches ? "dark" : "light"
            applyThemeToDocument(next)
            setThemeValue(next)
        }
        mediaQuery.addEventListener("change", onChange)
        return () => mediaQuery.removeEventListener("change", onChange)
    }, [theme])

    const value: ThemeProviderState = {
        theme,
        themeValue,
        setTheme: (next: Theme) => {
            if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, next)
            }
            setThemeState(next)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}
