import { SITES_KEY } from "@raven/lib/utils/nativeKeys"

/** Origins of the sites saved in the shell's picker. */
export const savedSiteOrigins = async (): Promise<string[]> => {
    const { Preferences } = await import("@capacitor/preferences")
    const { value } = await Preferences.get({ key: SITES_KEY })
    try { return value ? (JSON.parse(value) as { url: string }[]).map((s) => s.url) : [] } catch { return [] }
}
