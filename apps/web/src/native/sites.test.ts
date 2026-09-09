import { beforeEach, describe, expect, it, vi } from "vitest"
import { forgetSite, getDefaultSite, loadSites, normalizeSiteUrl, probeSite, saveSite, setDefaultSite, type Site } from "./sites"

const { prefs } = vi.hoisted(() => ({ prefs: new Map<string, string>() }))
vi.mock("@capacitor/preferences", () => ({
    Preferences: {
        get: async ({ key }: { key: string }) => ({ value: prefs.get(key) ?? null }),
        set: async ({ key, value }: { key: string; value: string }) => { prefs.set(key, value) },
        remove: async ({ key }: { key: string }) => { prefs.delete(key) },
        // Like the native proxy: any unknown property is a plugin method, `then` included.
        then: () => { throw new Error("Preferences.then() is not implemented") },
    },
}))

const site = (url: string, name = "A"): Site => ({ url, name, sitename: "a.com", clientId: "C", ravenVersion: "3.0.0" })

describe("saved sites", () => {
    beforeEach(() => prefs.clear())
    it("moves a saved site to the front", async () => {
        await saveSite(site("https://a.com"))
        await saveSite(site("https://b.com", "B"))
        await saveSite(site("https://a.com", "A2"))
        expect((await loadSites()).map((s) => [s.url, s.name])).toEqual([["https://a.com", "A2"], ["https://b.com", "B"]])
    })
    it("forgets a site and clears it as the default", async () => {
        await saveSite(site("https://a.com"))
        await setDefaultSite("https://a.com")
        await forgetSite("https://a.com")
        expect(await loadSites()).toEqual([])
        expect(await getDefaultSite()).toBeNull()
    })
    it("keeps another default when forgetting a different site", async () => {
        await saveSite(site("https://a.com"))
        await saveSite(site("https://b.com"))
        await setDefaultSite("https://b.com")
        await forgetSite("https://a.com")
        expect(await getDefaultSite()).toBe("https://b.com")
    })
})

describe("normalizeSiteUrl", () => {
    it("adds https and strips path and trailing slash", () => {
        expect(normalizeSiteUrl(" raven.example.com/raven/ ")).toBe("https://raven.example.com")
    })
    it("keeps explicit http and lowercases the host", () => {
        expect(normalizeSiteUrl("http://LocalHost:8000")).toBe("http://localhost:8000")
    })
    it("returns null for garbage", () => {
        expect(normalizeSiteUrl("not a url")).toBeNull()
        expect(normalizeSiteUrl("")).toBeNull()
    })
})

describe("probeSite", () => {
    const answer = (message: Record<string, unknown>, status = 200, url?: string) =>
        vi.fn(async () => ({ status, data: status === 200 ? { message } : {}, url }))
    const good = { client_id: "C", raven_version: "3.0.0", min_app_version: "2.0.0", sitename: "a.com", app_name: "Acme", logo: "/files/logo.png" }

    it("returns the site from the handshake, on the origin the site answered from", async () => {
        const getJson = answer(good, 200, "https://www.a.com/api/method/raven.api.native.handshake")
        const result = await probeSite("https://a.com", "2.0.0", getJson)
        expect(result).toEqual({ site: { url: "https://www.a.com", name: "Acme", sitename: "a.com", clientId: "C", logo: "/files/logo.png", ravenVersion: "3.0.0" } })
        expect(getJson).toHaveBeenCalledWith("https://a.com/api/method/raven.api.native.handshake")
    })
    it("reports a site without the handshake as too old", async () => {
        expect(await probeSite("https://a.com", "2.0.0", answer({}, 404))).toEqual({ error: "site-too-old" })
    })
    it("reports a non-Raven answer", async () => {
        expect(await probeSite("https://a.com", "2.0.0", vi.fn(async () => ({ status: 200, data: "<html>" })))).toEqual({ error: "not-raven" })
    })
    it("reports an unreachable host", async () => {
        expect(await probeSite("https://a.com", "2.0.0", vi.fn(async () => { throw new Error("timeout") }))).toEqual({ error: "unreachable" })
    })
    it("reports an app older than the site demands", async () => {
        expect(await probeSite("https://a.com", "1.9.0", answer(good))).toEqual({ error: "app-too-old" })
    })
    it("reports a site without a usable OAuth client", async () => {
        expect(await probeSite("https://a.com", "2.0.0", answer({ ...good, client_id: null }))).toEqual({ error: "no-client" })
    })
})
