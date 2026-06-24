import ErrorBanner from "@components/ui/error-banner"
import { Label } from "@components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Separator } from "@components/ui/separator"
import { SettingsPanelDescription, SettingsPanelHeader, SettingsPanelTitle, SettingsPanelContent } from "@components/ui/settings-dialog"
import { Switch } from "@components/ui/switch"
import { useTheme } from "@components/theme-provider"
import _ from "@lib/translate"
import { useFrappeGetDoc, useFrappePostCall, useFrappeUpdateDoc } from "frappe-react-sdk"
import { toast } from "sonner"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { RavenUser } from "@raven/types/Raven/RavenUser"

const Appearance = () => {

    const { myProfile } = useCurrentRavenUser()

    const { updateDoc } = useFrappeUpdateDoc()

    const onUpdate = (field: keyof RavenUser, value: string | number) => {

    }
    return (
        <>
            <SettingsPanelHeader>
                <SettingsPanelTitle>{_("Appearance")}</SettingsPanelTitle>
                <SettingsPanelDescription>{_("Configure how you want Raven to look.")}</SettingsPanelDescription>
            </SettingsPanelHeader>
            <SettingsPanelContent>

                <div className='flex flex-col gap-4 w-full'>
                    {/* {error && <ErrorBanner error={error} />} */}

                    <div className="flex flex-col flex-1 gap-4">

                        <ThemeSwitcher />

                        {/* <div className="flex justify-between items-center gap-8 py-3">
                        <div className="flex flex-col">
                            <Label htmlFor="transfer_match_days" className="text-p-base text-ink-gray-6">{_("Number of days to match transfers")}</Label>
                            <p className="text-p-sm text-ink-gray-5">
                                {_("For example, if set to 4, the system will try to find matching transfer transactions in other banks 4 days before and after the transaction date. This is because transactions can clear on different days on different bank accounts.")}
                            </p>
                        </div>
                        <div className="min-w-40 flex justify-end">
                            <Select onValueChange={(value) => onUpdate("transfer_match_days", Number(value))} value={accountsSettings?.transfer_match_days?.toString()}>
                                <SelectTrigger id="transfer_match_days" className="min-w-32">
                                    <SelectValue placeholder={_("Select number of days")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">{_("Same day")}</SelectItem>
                                    <SelectItem value="1">{_("Within 1 day")}</SelectItem>
                                    <SelectItem value="2">{_("Within 2 days")}</SelectItem>
                                    <SelectItem value="3">{_("Within 3 days")}</SelectItem>
                                    <SelectItem value="4">{_("Within 4 days")}</SelectItem>
                                    <SelectItem value="5">{_("Within 5 days")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div> */}

                        <Separator />

                        <LeftRightLayoutSwitcher />

                        {/* <div className="flex justify-between items-center gap-8 py-3">
                        <div className="flex flex-col">
                            <Label htmlFor="automatically_run_rules_on_unreconciled_transactions" className="text-p-base text-ink-gray-6">{_("Automatically run rules on unreconciled transactions")}</Label>
                            <p className="text-p-sm text-ink-gray-5">
                                {_("This will automatically run transaction matching rules on unreconciled transactions every hour.")}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Switch
                                id="automatically_run_rules_on_unreconciled_transactions"
                                className="dark:disabled:bg-surface-gray-2"
                                disabled={isLoading}
                                checked={accountsSettings?.automatically_run_rules_on_unreconciled_transactions === 1}
                                onCheckedChange={(checked) => onUpdate("automatically_run_rules_on_unreconciled_transactions", checked ? 1 : 0)}
                            />
                        </div>
                    </div> */}

                        {/* <div className="flex justify-between items-center gap-8 py-3">
                        <div className="flex flex-col">
                            <Label htmlFor="enable_party_matching" className="text-p-base text-ink-gray-6">{_("Enable automatic party matching")}</Label>
                            <p className="text-p-sm text-ink-gray-5">
                                {_("The system will attempt to automatically match a party to a bank transaction based on account number or IBAN.")}

                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Switch
                                id="enable_party_matching"
                                className="dark:disabled:bg-surface-gray-2"
                                disabled={isLoading}
                                checked={accountsSettings?.enable_party_matching === 1}
                                onCheckedChange={(checked) => onUpdate("enable_party_matching", checked ? 1 : 0)}
                            />
                        </div>
                    </div> */}

                        {/* <div className="flex justify-between items-center gap-8 py-3">
                        <div className="flex flex-col">
                            <Label htmlFor="enable_fuzzy_matching" className="text-p-base text-ink-gray-6">{_("Enable party name/description fuzzy matching")}</Label>
                            <p className="text-p-sm text-ink-gray-5">
                                {_("If a party cannot be matched by account number or IBAN, the system will try fuzzy matching using the party name and transaction description.")}

                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Switch
                                id="enable_fuzzy_matching"
                                className="dark:disabled:bg-surface-gray-2"
                                disabled={accountsSettings?.enable_party_matching !== 1 || isLoading}
                                checked={accountsSettings?.enable_fuzzy_matching === 1}
                                onCheckedChange={(checked) => onUpdate("enable_fuzzy_matching", checked ? 1 : 0)}
                            />
                        </div>
                    </div> */}

                    </div>



                    {/* <DataField
                            name='transfer_match_days'
                            label={_("Number of days to match transfers")}
                            isRequired
                            inputProps={{
                                type: 'number',
                                inputMode: 'numeric',
                            }}
                            formDescription={_("For example, if set to 4, the system will try to find matching transactions in other banks 4 days before and after the transaction date. This is because transactions can clear on different days on different bank accounts.")}
                        /> */}

                </div>
            </SettingsPanelContent>
        </>
    )
}


const ThemeSwitcher = () => {

    const { theme, setTheme } = useTheme()

    const themeCards: Array<{ value: "dark" | "light" | "system", label: string }> = [
        {
            value: "system",
            label: _("Automatic"),
        },
        {
            value: "light",
            label: _("Light"),
        },
        {
            value: "dark",
            label: _("Dark"),
        }
    ]

    return <div className="flex flex-col gap-3 pb-3">
        <div className="flex flex-col">
            <Label className="text-p-base-medium text-ink-gray-6">{_("Theme")}</Label>
            <p className="text-p-sm text-ink-gray-5">
                {_("Switch between light, dark, or system theme")}
            </p>
        </div>
        <div className="flex gap-3">
            {themeCards.map((option) => {
                const selected = theme === option.value

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        aria-pressed={selected}
                        className={`flex-1 basis-0 min-w-0 overflow-hidden rounded-lg border cursor-pointer transition-colors focus-visible:focus-default ${selected ? "border-outline-gray-8" : "border-outline-gray-3 hover:border-outline-gray-5"}`}
                    >
                        {option.value === "system" ? (
                            <div className="flex w-full min-w-0">
                                <ThemePreviewWindow theme="light" roundedClass="rounded-tl-[10.5px]" />
                                <ThemePreviewWindow theme="dark" roundedClass="rounded-tr-[10.5px]" />
                            </div>
                        ) : (
                            <ThemePreviewWindow theme={option.value} roundedClass="rounded-t-[10.5px]" />
                        )}
                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="text-base text-ink-gray-7">{option.label}</div>
                            <span className={`rounded-full size-3.5 ${selected ? "border-4 border-outline-gray-8" : "border border-outline-gray-4"}`} />
                        </div>
                    </button>
                )
            })}
        </div>
    </div>

}

const ThemePreviewWindow = ({ theme, roundedClass }: { theme: "light" | "dark", roundedClass: string }) => {
    const isLight = theme === "light"
    const frameClass = isLight ? "bg-white border-gray-100" : "bg-gray-900 border-gray-800"
    const subtleSurfaceClass = isLight ? "bg-gray-50" : "bg-gray-800"
    const mutedLineClass = isLight ? "bg-gray-200" : "bg-gray-700"
    const mutedLineStrongClass = isLight ? "bg-gray-300" : "bg-gray-600"
    const dividerClass = isLight ? "border-gray-100" : "border-gray-800"
    const cardClass = isLight ? "bg-white border-gray-200" : "bg-gray-900 border-gray-700"

    return <div className={`flex flex-1 min-w-0 pl-5 pt-3.5 ${isLight ? "bg-surface-gray-2" : "bg-surface-gray-3"} ${roundedClass}`}>
        <div className={`w-full rounded-tl-sm border border-b-0 ${frameClass}`}>
            <div className={`flex gap-[3px] py-[3px] px-1 border-b ${dividerClass}`}>
                <div className="size-1.5 bg-[#FF5F57] rounded-full" />
                <div className="size-1.5 bg-[#FEBC2D] rounded-full" />
                <div className="size-1.5 bg-[#28C840] rounded-full" />
            </div>
            {/* Raven's anatomy in miniature: thin workspace rail · channel sidebar ·
                chat island (header / messages / composer) floating on the canvas gutter. */}
            <div className="flex h-20">
                {/* 1. Primary rail — workspace switcher (thin) */}
                <div className={`flex w-2.5 flex-col items-center gap-1 border-r py-1.5 ${subtleSurfaceClass} ${dividerClass}`}>
                    <div className={`size-1.5 rounded-[2px] ${mutedLineStrongClass}`} />
                    <div className={`size-1.5 rounded-[2px] ${mutedLineClass}`} />
                    <div className={`size-1.5 rounded-[2px] ${mutedLineClass}`} />
                </div>

                {/* 2. Channel sidebar */}
                <div className={`flex w-8 flex-col gap-1 py-1.5 px-1 ${subtleSurfaceClass}`}>
                    <div className={`h-1 w-5 rounded-full ${mutedLineStrongClass}`} />
                    <div className="mt-0.5 flex flex-col gap-1">
                        <div className={`h-1 w-full rounded-full ${mutedLineClass}`} />
                        <div className={`h-1 w-4/5 rounded-full ${mutedLineClass}`} />
                        <div className={`h-1 w-full rounded-full ${mutedLineStrongClass}`} />
                        <div className={`h-1 w-3/5 rounded-full ${mutedLineClass}`} />
                        <div className={`h-1 w-4/5 rounded-full ${mutedLineClass}`} />
                    </div>
                </div>

                {/* 3. Chat island on the canvas gutter */}
                <div className={`flex min-w-0 flex-1 p-0.5 ${subtleSurfaceClass}`}>
                    <div className={`flex min-w-0 flex-1 flex-col rounded-sm border ${cardClass}`}>
                        {/* header */}
                        <div className={`flex items-center border-b px-1.5 py-1 ${dividerClass}`}>
                            <div className={`h-1 w-7 rounded-full ${mutedLineStrongClass}`} />
                        </div>
                        {/* messages */}
                        <div className="flex flex-1 flex-col gap-1.5 p-1.5">
                            {[
                                { avatar: mutedLineStrongClass, lines: ["w-3/5", "w-4/5"] },
                                { avatar: mutedLineStrongClass, lines: ["w-2/5", "w-3/5"] },
                            ].map((row, index) => (
                                <div key={index} className="flex items-start gap-1">
                                    <div className={`size-1.5 shrink-0 rounded-full ${row.avatar}`} />
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        {row.lines.map((width, lineIndex) => (
                                            <div key={lineIndex} className={`h-1 ${width} rounded-full ${mutedLineClass}`} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* composer */}
                        <div className="p-1.5 pt-0">
                            <div className={`h-2 w-full rounded-sm ${subtleSurfaceClass} ${dividerClass}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}


type PreviewMessage = { own: boolean; image?: boolean; width?: string }

// Same composition (3 text + 1 image) for both styles, so the two cards stay equal height.
// "Simple" keeps everything left; "Left-Right" pushes the user's own messages/media right.
const SIMPLE_MESSAGES: PreviewMessage[] = [
    { own: false, width: "w-1/2" },
    { own: false, width: "w-2/5" },
    { own: false, image: true },
    { own: false, width: "w-1/3" },
]

const LEFT_RIGHT_MESSAGES: PreviewMessage[] = [
    { own: false, width: "w-1/2" },
    { own: true, width: "w-2/5" },
    { own: true, image: true },
    { own: false, width: "w-1/3" },
]

/**
 * Full Raven window (thin workspace rail · channel sidebar · chat island) showing how
 * messages align for each chat style. Uses real surface tokens — unlike the theme cards
 * (fixed light/dark), this previews layout, so it should reflect the active theme.
 */
const ChatStylePreview = ({ style }: { style: "Simple" | "Left-Right" }) => {
    const messages = style === "Simple" ? SIMPLE_MESSAGES : LEFT_RIGHT_MESSAGES

    return (
        <div className="flex pl-5 pt-3.5 bg-surface-gray-2 rounded-t-[10.5px]">
            <div className="w-full rounded-tl-sm border border-b-0 border-outline-gray-2 bg-surface-base">
                <div className="flex gap-[3px] py-[3px] px-1 border-b border-outline-gray-2">
                    <div className="size-1.5 bg-[#FF5F57] rounded-full" />
                    <div className="size-1.5 bg-[#FEBC2D] rounded-full" />
                    <div className="size-1.5 bg-[#28C840] rounded-full" />
                </div>
                <div className="flex h-28">
                    {/* Primary rail — workspace switcher */}
                    <div className="flex w-2.5 flex-col items-center gap-1 border-r border-outline-gray-2 bg-surface-gray-2 py-1.5">
                        <div className="size-1.5 rounded-[2px] bg-surface-gray-4" />
                        <div className="size-1.5 rounded-[2px] bg-surface-gray-3" />
                        <div className="size-1.5 rounded-[2px] bg-surface-gray-3" />
                    </div>
                    {/* Channel sidebar */}
                    <div className="flex w-8 flex-col gap-1 bg-surface-gray-2 p-1.5">
                        <div className="h-1.5 w-5 rounded-full bg-surface-gray-4" />
                        <div className="mt-0.5 flex flex-col gap-1">
                            {["w-full", "w-4/5", "w-full", "w-3/5", "w-4/5", "w-2/3"].map((w, i) => (
                                <div key={i} className={`h-1 ${w} rounded-full ${i === 2 ? "bg-surface-gray-4" : "bg-surface-gray-3"}`} />
                            ))}
                        </div>
                    </div>
                    {/* Chat island on the canvas gutter */}
                    <div className="flex min-w-0 flex-1 bg-surface-gray-2 p-1">
                        <div className="flex min-w-0 flex-1 flex-col rounded-sm border border-outline-gray-2 bg-surface-base">
                            <div className="flex items-center border-b border-outline-gray-2 px-1.5 py-1">
                                <div className="h-1.5 w-7 rounded-full bg-surface-gray-4" />
                            </div>
                            <div className="flex flex-1 flex-col gap-1 overflow-hidden p-1.5">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex items-end gap-1 ${msg.own ? "justify-end" : "justify-start"}`}>
                                        {!msg.own && <div className="size-2 shrink-0 rounded-full bg-surface-gray-3" />}
                                        {msg.image ? (
                                            <div className="h-4 w-10 rounded-sm bg-surface-gray-3" />
                                        ) : (
                                            <div className={`h-2 ${msg.width} rounded-md bg-surface-gray-3`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="p-1.5 pt-0">
                                <div className="h-2.5 w-full rounded-sm bg-surface-gray-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const LeftRightLayoutSwitcher = () => {

    const { myProfile, mutate } = useCurrentRavenUser()

    const { call } = useFrappePostCall('frappe.client.set_value')

    const setChatStyle = (style: string) => {
        if (!myProfile?.name) return;
        call({
            doctype: 'Raven User',
            name: myProfile.name,
            fieldname: 'chat_style',
            value: style
        }).then(() => {
            window.frappe.boot.chat_style = style
            mutate()
            toast.success('Chat style updated')
        }).catch((e) => {
            toast.error(e.message)
        })
    }

    const currentStyle = myProfile?.chat_style ?? "Simple"

    const chatStyleCards: Array<{ value: "Simple" | "Left-Right"; label: string }> = [
        { value: "Simple", label: _("Simple") },
        { value: "Left-Right", label: _("Left-Right") },
    ]

    return <div className="flex flex-col gap-3 pb-3">
        <div className="flex flex-col">
            <Label className="text-p-base-medium text-ink-gray-6">{_("Chat Layout")}</Label>
            <p className="text-p-sm text-ink-gray-5">
                {_("Switch between simple and left-right chat layout")}
            </p>
        </div>
        <div className="flex gap-3">
            {chatStyleCards.map((option) => {
                const selected = currentStyle === option.value

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setChatStyle(option.value)}
                        aria-pressed={selected}
                        className={`flex-1 basis-0 min-w-0 overflow-hidden rounded-lg border cursor-pointer transition-colors focus-visible:focus-default ${selected ? "border-outline-gray-8" : "border-outline-gray-3 hover:border-outline-gray-5"}`}
                    >
                        <ChatStylePreview style={option.value} />
                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="text-base text-ink-gray-7">{option.label}</div>
                            <span className={`rounded-full size-3.5 ${selected ? "border-4 border-outline-gray-8" : "border border-outline-gray-4"}`} />
                        </div>
                    </button>
                )
            })}
        </div>
    </div>

}

export default Appearance