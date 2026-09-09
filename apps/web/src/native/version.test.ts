import { describe, expect, it } from "vitest"
import { versionAtLeast } from "./version"

describe("versionAtLeast", () => {
    it("compares numerically per segment", () => {
        expect(versionAtLeast("2.10.0", "2.9.0")).toBe(true)
        expect(versionAtLeast("2.0.0", "2.0.1")).toBe(false)
    })
    it("treats missing segments as zero", () => {
        expect(versionAtLeast("2", "2.0.0")).toBe(true)
        expect(versionAtLeast("2.0", "2.0.1")).toBe(false)
    })
})
