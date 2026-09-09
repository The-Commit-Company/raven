import { useEffect, useState } from "react"
import { ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@components/ui/alert-dialog"
import _ from "@lib/translate"
import { signIn, signOut, tokenStore } from "./auth"
import { forgetSite, loadSites, normalizeSiteUrl, probeSite, saveSite, setDefaultSite, type ProbeResult, type Site } from "./sites"

const probeMessage = (result: Exclude<ProbeResult, { site: Site }>) => ({
    "unreachable": _("Could not reach this site."),
    "not-raven": _("This does not look like a Raven site."),
    "site-too-old": _("This site runs an older Raven. Ask its admin to update."),
    "app-too-old": _("Update the Raven app to use this site."),
    "no-client": _("This site has no OAuth client for the app. Ask its admin to set one up in Raven Settings."),
}[result.error])

const appVersion = async () => (await import("@capacitor/app")).App.getInfo().then((i) => i.version).catch(() => "0")

/** Opens a saved site: silent when tokens exist, else the browser login. */
const open = async (site: Site) => {
    // Records saved by the remote-loading app lack the handshake fields; fetch them once.
    if (!site.sitename || !site.clientId) {
        const result = await probeSite(site.url, await appVersion())
        if ("error" in result) throw new Error(probeMessage(result))
        site = result.site
    }
    if (!(await tokenStore.get(site.url))) await signIn(site.url, site.clientId)
    await saveSite(site)
    await setDefaultSite(site.url)
    window.location.replace("/")
}

export const SitePicker = () => {
    const [sites, setSites] = useState<Site[]>([])
    const [url, setUrl] = useState("")
    const [busy, setBusy] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [removing, setRemoving] = useState<Site | null>(null)

    useEffect(() => { loadSites().then(setSites) }, [])

    const run = async (key: string, action: () => Promise<void>) => {
        setBusy(key)
        setError("")
        try {
            await action()
        } catch (e) {
            setError(String((e as { message?: string })?.message ?? e))
        } finally {
            setBusy(null)
        }
    }

    const addSite = () => run("add", async () => {
        const origin = normalizeSiteUrl(url)
        if (!origin) throw new Error(_("Enter a site address."))
        const result = await probeSite(origin, await appVersion())
        if ("error" in result) throw new Error(probeMessage(result))
        await open(result.site)
    })

    const remove = (site: Site) => run(site.url, async () => {
        setRemoving(null)
        await signOut(site.url)
        await forgetSite(site.url)
        setSites(await loadSites())
    })

    return (
        <main className="min-h-dvh bg-surface-white text-ink-gray-9 flex flex-col gap-6 px-5 pt-16 pb-8 max-w-md mx-auto w-full">
            <h1 className="text-3xl font-semibold">raven</h1>
            {sites.length > 0 && (
                <section className="flex flex-col gap-2">
                    <p className="text-sm text-ink-gray-6">{_("Select a site")}</p>
                    <ul className="flex flex-col gap-2">
                        {sites.map((site) => (
                            <li key={site.url} className="flex items-center gap-2">
                                <button type="button" disabled={busy !== null} onClick={() => run(site.url, () => open(site))}
                                    className="flex flex-1 items-center gap-3 rounded-lg bg-surface-gray-2 px-3 py-3 text-left active:bg-surface-gray-3">
                                    {site.logo && <img src={new URL(site.logo, site.url).href} alt="" className="size-10 rounded-md" />}
                                    <span className="flex flex-1 flex-col min-w-0">
                                        <span className="text-base font-medium truncate">{site.name}</span>
                                        <span className="text-sm text-ink-gray-6 truncate">{new URL(site.url).host}</span>
                                    </span>
                                    <ChevronRight className="text-ink-gray-5" />
                                </button>
                                <Button type="button" variant="ghost" size="md" isIconButton aria-label={_("Remove site")} disabled={busy !== null} onClick={() => setRemoving(site)}>
                                    <Trash2 />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); addSite() }}>
                <label htmlFor="site-url" className="text-sm text-ink-gray-6">{_("Site URL")}</label>
                {/* type="text": a type="url" input rejects a bare host; normalizeSiteUrl adds https. */}
                <Input id="site-url" type="text" inputMode="url" placeholder="raven.frappe.cloud" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    value={url} onChange={(e) => setUrl(e.target.value)} />
                <Button type="submit" variant="solid" size="lg" loading={busy === "add"} loadingText={_("Connecting…")}>{_("Add site")}</Button>
            </form>
            <p role="alert" className="min-h-5 text-sm text-ink-red-6">{error}</p>
            <AlertDialog open={removing !== null} onOpenChange={(o) => { if (!o) setRemoving(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold">{_("Remove {0}?", [removing?.name ?? ""])}</AlertDialogTitle>
                        <AlertDialogDescription>{_("You will be logged out of this site on this device.")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{_("Cancel")}</AlertDialogCancel>
                        <Button type="button" variant="solid" theme="red" size="md" onClick={() => removing && remove(removing)}>{_("Remove")}</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}
