import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

function getSystemTheme(): Theme {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyThemeToDocument(theme: Theme) {
    if (typeof document === "undefined") return

    const root = document.documentElement
    root.classList.remove("light", "dark")

    const resolved = theme === "system" ? getSystemTheme() : theme
    root.classList.add(resolved)
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window === "undefined") {
            return defaultTheme
        }
        const stored = (window.localStorage.getItem(storageKey) as Theme | null) || defaultTheme
        applyThemeToDocument(stored)
        return stored
    })

    const value: ThemeProviderState = {
        theme,
        setTheme: (next: Theme) => {
            if (typeof window !== "undefined") {
                window.localStorage.setItem(storageKey, next)
            }
            applyThemeToDocument(next)
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
