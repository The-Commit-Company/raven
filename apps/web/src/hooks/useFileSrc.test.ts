import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { resolveFileSrc, _cachedBytes, _resetFileSrcCache } from "./useFileSrc"
import { setActiveSite, _resetActiveSite } from "@lib/site"

beforeEach(() => {
    ;(globalThis as any).window = { location: { origin: "http://app.test" } }
    if (!URL.createObjectURL) URL.createObjectURL = () => ""
    if (!URL.revokeObjectURL) URL.revokeObjectURL = () => { }
})
afterEach(() => { _resetActiveSite(); _resetFileSrcCache(); vi.restoreAllMocks(); delete (globalThis as any).window })

describe("resolveFileSrc", () => {
    it("returns the path unchanged in the browser", async () => {
        expect(await resolveFileSrc("/private/files/a.png")).toBe("/private/files/a.png")
    })
    it("prefixes public paths in native without fetching", async () => {
        setActiveSite("https://a.com", () => "AT")
        const f = vi.spyOn(globalThis, "fetch")
        expect(await resolveFileSrc("/files/a.png")).toBe("https://a.com/files/a.png")
        expect(f).not.toHaveBeenCalled()
    })
    it("fetches private paths with the token into an object URL, once per path", async () => {
        setActiveSite("https://a.com", () => "AT")
        const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new Blob(["x"], { type: "image/png" })))
        const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:1")
        expect(await resolveFileSrc("/private/files/a.png")).toBe("blob:1")
        expect(await resolveFileSrc("/private/files/a.png")).toBe("blob:1")
        expect(f).toHaveBeenCalledTimes(1)
        expect(f.mock.calls[0][0]).toBe("https://a.com/private/files/a.png")
        expect((f.mock.calls[0][1] as RequestInit).headers).toEqual({ Authorization: "Bearer AT" })
        expect(create).toHaveBeenCalledTimes(1)
    })
    it("keeps the fetched bytes under the budget, revoking the oldest object URLs first", async () => {
        setActiveSite("https://a.com", () => "AT")
        const mb = (n: number) => new Response(new Blob([new Uint8Array(n * 1024 * 1024)], { type: "image/png" }))
        vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => mb(String(url).endsWith("big.png") ? 40 : 20))
        let n = 0
        vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:${++n}`)
        const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { })
        await resolveFileSrc("/private/files/a.png")
        expect(_cachedBytes()).toBe(20 * 1024 * 1024)
        expect(revoke).not.toHaveBeenCalled()
        // 20 + 40 MB is over the 50 MB budget: the oldest goes, the new one stays.
        await resolveFileSrc("/private/files/big.png")
        expect(revoke.mock.calls.map((c) => c[0])).toEqual(["blob:1"])
        expect(_cachedBytes()).toBe(40 * 1024 * 1024)
        await resolveFileSrc("/private/files/c.png")
        expect(revoke.mock.calls.map((c) => c[0])).toEqual(["blob:1", "blob:2"])
        expect(_cachedBytes()).toBe(20 * 1024 * 1024)
        expect(await resolveFileSrc("/private/files/c.png")).toBe("blob:3")
    })
    it("never revokes the URL it is about to return, nor a still-pending entry", async () => {
        setActiveSite("https://a.com", () => "AT")
        let releaseSlow: (r: Response) => void = () => { }
        const mb = (n: number) => new Response(new Blob([new Uint8Array(n * 1024 * 1024)], { type: "image/png" }))
        vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
            String(url).endsWith("slow.png") ? new Promise<Response>((r) => { releaseSlow = r }) : mb(60))
        let n = 0
        vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:${++n}`)
        const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => { })
        const slow = resolveFileSrc("/private/files/slow.png")
        // 60 MB alone is over budget: it stays, and the pending entry is not touched.
        expect(await resolveFileSrc("/private/files/big.png")).toBe("blob:1")
        expect(revoke).not.toHaveBeenCalled()
        releaseSlow(mb(20))
        // The pending one lands alive; the oversized older entry is the one that goes.
        expect(await slow).toBe("blob:2")
        expect(revoke.mock.calls.map((c) => c[0])).toEqual(["blob:1"])
        expect(_cachedBytes()).toBe(20 * 1024 * 1024)
    })
    it("falls back to the site URL when the fetch fails, and retries next time", async () => {
        setActiveSite("https://a.com", () => "AT")
        const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 403 }))
        expect(await resolveFileSrc("/private/files/a.png")).toBe("https://a.com/private/files/a.png")
        await resolveFileSrc("/private/files/a.png")
        expect(f).toHaveBeenCalledTimes(2)
    })
})
