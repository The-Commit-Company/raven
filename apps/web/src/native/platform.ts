declare global {
    interface Window { Capacitor?: { isNativePlatform(): boolean; getPlatform(): string } }
}

// Reads the bridge global only — never imports @capacitor/core, so browser
// bundles stay free of Capacitor code.
export const isNative = (): boolean =>
    typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.() === true

export const nativePlatform = (): "ios" | "android" | "web" => {
    const p = typeof window !== "undefined" ? window.Capacitor?.getPlatform?.() : undefined
    return p === "ios" || p === "android" ? p : "web"
}

export const shellOrigin = (): string =>
    nativePlatform() === "ios" ? "capacitor://localhost" : "https://localhost"

type Handle = { remove: () => Promise<void> }
// Registers a plugin listener and returns its disposer. Disposing before the
// registration resolves still removes the listener.
export const listenNative = (register: () => Promise<Handle>): (() => void) => {
    let disposed = false
    let handle: Handle | undefined
    register().then((h) => { if (disposed) h.remove().catch(() => { }); else handle = h }).catch(() => { })
    return () => { disposed = true; handle?.remove().catch(() => { }) }
}
