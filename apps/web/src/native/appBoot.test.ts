import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadBoot } from "./appBoot"
import { setActiveSite, siteKey, _resetActiveSite } from "@lib/site"
import { clearSessionUser, sessionUser } from "@lib/sessionUser"

const store = new Map<string, string>()
beforeEach(() => {
    store.clear()
    ;(globalThis as any).window = { location: { origin: "http://app.test" } }
    ;(globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v) },
        removeItem: (k: string) => { store.delete(k) },
    }
    setActiveSite("https://a.com", () => "AT")
})
afterEach(() => { _resetActiveSite(); clearSessionUser(); vi.restoreAllMocks(); delete (globalThis as any).window; delete (globalThis as any).localStorage })

const boot = { sitename: "a.com", user: { name: "alice@x.com" }, user_info: { "alice@x.com": { fullname: "Alice", image: "/files/a.png" } }, __messages: { Hello: "Hallo" } }

describe("loadBoot", () => {
    it("fetches boot with the token, installs it, and caches it per site", async () => {
        const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ message: boot })))
        expect(await loadBoot()).toBe(true)
        expect(f.mock.calls[0][0]).toBe("https://a.com/api/method/raven.api.native.boot")
        expect((f.mock.calls[0][1] as RequestInit).headers).toEqual({ Authorization: "Bearer AT" })
        expect(window.frappe.boot.sitename).toBe("a.com")
        expect(window.frappe._messages.Hello).toBe("Hallo")
        expect(sessionUser()).toEqual({ name: "alice@x.com", fullName: "Alice", image: "/files/a.png" })
        expect(JSON.parse(store.get(siteKey("raven-boot-cache"))!).sitename).toBe("a.com")
    })
    it("falls back to the cached boot when the fetch fails", async () => {
        store.set(siteKey("raven-boot-cache"), JSON.stringify(boot))
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"))
        expect(await loadBoot()).toBe(true)
        expect(window.frappe.boot.user.name).toBe("alice@x.com")
    })
    it("reports no boot when both fail", async () => {
        vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"))
        expect(await loadBoot()).toBe(false)
    })
})
