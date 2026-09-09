import { FrappeProvider, useFrappeGetCall } from "frappe-react-sdk"
import { Button } from "@components/ui/button"
import _ from "@lib/translate"
import { signOut } from "./auth"
import { onRequestError, switchSite, type ActiveSession } from "./session"
import { forgetSite } from "./sites"

const WhoAmI = ({ session }: { session: ActiveSession }) => {
    const { data, error, isLoading } = useFrappeGetCall<{ message: string }>("frappe.auth.get_logged_user")
    const logOut = async () => {
        await signOut(session.site.url)
        await forgetSite(session.site.url)
        window.location.replace("/")
    }
    return (
        <main className="min-h-dvh bg-surface-white text-ink-gray-9 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <h1 className="text-2xl font-semibold">{session.site.name}</h1>
            <p className="text-ink-gray-6">{new URL(session.site.url).host}</p>
            <p className="text-lg">{isLoading ? _("Checking session…") : error ? String(error.message) : _("Logged in as {0}", [data?.message ?? ""])}</p>
            <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" size="md" onClick={switchSite}>{_("Switch site")}</Button>
                <Button type="button" variant="solid" theme="red" size="md" onClick={logOut}>{_("Log out")}</Button>
            </div>
        </main>
    )
}

// Layer 2 proof of the provider on a bearer token; layer 3 renders <App /> here instead.
export const SessionScreen = ({ session }: { session: ActiveSession }) => (
    <FrappeProvider
        url={session.site.url}
        tokenParams={{ useToken: true, type: "Bearer", token: session.getToken }}
        siteName={session.site.sitename}
        swrConfig={{ onError: onRequestError }}
    >
        <WhoAmI session={session} />
    </FrappeProvider>
)
