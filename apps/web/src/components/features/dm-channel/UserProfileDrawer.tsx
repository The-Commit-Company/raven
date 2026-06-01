import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { UserAvatar, getStatusIndicatorColor } from "@components/features/message/UserAvatar"
import { Bot, Copy, Mail, Palmtree, Phone, UserX } from "lucide-react"
import { toast } from "sonner"
import type { UserData } from "@db"
import { useGetEmployee } from "@raven/lib/hooks/useGetEmployee"
import { useIsUserOnLeave } from "@hooks/useIsUserOnLeave"
import _ from "@lib/translate"

interface UserProfileDrawerProps {
    user: UserData
}

async function copyToClipboard(text: string, label: string) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success(_("{0} copied to clipboard", [label]))
    } catch {
        toast.error(_("Failed to copy {0}", [label]))
    }
}

export function UserProfileDrawer({ user }: UserProfileDrawerProps) {
    const { employee } = useGetEmployee(user.name)
    const isOnLeave = useIsUserOnLeave(user.name)
    const displayName = user.full_name || user.first_name || user.name
    const isInvisible = user.availability_status === "Invisible"
    const availability = !isInvisible ? (user.availability_status ?? "") : ""
    const customStatus = user.custom_status?.trim() || ""
    const hasStatus = Boolean(availability || customStatus)
    const statusColor = availability ? getStatusIndicatorColor(availability) : ""

    const isBot = user.type === "Bot"
    const isDisabled = user.enabled === 0
    const hasBadges = isBot || isDisabled || isOnLeave

    const employeeBits = [employee?.designation, employee?.department, employee?.team].filter(Boolean)
    const hasEmployeeInfo = employeeBits.length > 0
    const employeeInfo = employeeBits.join(" · ")

    return (
        <div className="px-1 space-y-4 pb-4 pt-2">
            {/* Profile card */}
            <section className="p-4 border border-outline-gray-2/70 rounded-lg flex flex-col items-center text-center">
                <UserAvatar
                    user={user}
                    size="xl"
                    showStatusIndicator={user.availability_status != null && user.availability_status !== "Invisible"}
                    showBotIndicator={false}
                />
                <h2 className="mt-3 text-lg font-semibold text-ink-gray-8 leading-tight">
                    {displayName}
                </h2>
                {hasBadges && (
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                        {isBot && (
                            <Badge size="sm" variant="subtle" theme="violet">
                                <Bot />
                                {_("Bot")}
                            </Badge>
                        )}
                        {isDisabled && (
                            <Badge size="sm" variant="subtle" theme="gray">
                                <UserX />
                                {_("Disabled")}
                            </Badge>
                        )}
                        {isOnLeave && (
                            <Badge size="sm" variant="subtle" theme="orange">
                                <Palmtree />
                                {_("On Leave")}
                            </Badge>
                        )}
                    </div>
                )}
                {hasEmployeeInfo && (
                    <p className="mt-1.5 text-sm font-medium text-ink-gray-5">
                        {employeeInfo}
                    </p>
                )}
                <p className="mt-1 flex items-center justify-center gap-1 text-sm text-ink-gray-4">
                    <span>{user.name}</span>
                </p>
            </section>

            {/* Status */}
            {hasStatus && (
                <section className="space-y-2">
                    <h3 className="font-semibold text-sm text-ink-gray-8">{_("Status")}</h3>
                    <div className="p-3 border border-outline-gray-2/70 rounded-lg space-y-1.5">
                        {availability && (
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusColor}`}
                                    aria-hidden
                                />
                                <span className="text-sm text-ink-gray-8">{availability}</span>
                            </div>
                        )}
                        {customStatus && (
                            <p className="text-sm text-ink-gray-4">{customStatus}</p>
                        )}
                    </div>
                </section>
            )}

            {/* Contact information */}
            <section className="space-y-2">
                <h3 className="font-semibold text-sm text-ink-gray-8">{_("Contact information")}</h3>
                <div className="border border-outline-gray-2/70 rounded-lg divide-y divide-outline-gray-2/50">
                    <ContactRow
                        icon={<Mail className="h-4 w-4 text-ink-gray-7" strokeWidth={2} />}
                        label={_("Email")}
                        value={employee?.preferred_email ?? ""}
                        href={employee?.preferred_email ? `mailto:${employee.preferred_email}` : undefined}
                        emptyText={_("No email added")}
                        copyLabel={_("Email")}
                    />
                    <ContactRow
                        icon={<Phone className="h-4 w-4 text-ink-gray-7" strokeWidth={2} />}
                        label={_("Phone")}
                        value={employee?.cell_number ?? ""}
                        href={employee?.cell_number ? `tel:${employee.cell_number}` : undefined}
                        emptyText={_("No phone number")}
                        copyLabel={_("Phone number")}
                    />
                </div>
            </section>
        </div>
    )
}


interface ContactRowProps {
    icon: React.ReactNode
    label: string
    value: string
    href?: string
    emptyText: string
    copyLabel: string
}

function ContactRow({ icon, label, value, href, emptyText, copyLabel }: ContactRowProps) {
    return (
        <div className="group flex items-center gap-3 px-3 py-2.5 hover:bg-surface-gray-2/50 transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-gray-2">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-gray-4">{label}</p>
                {value ? (
                    <a
                        href={href}
                        className="text-sm text-ink-gray-8 hover:underline block truncate"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-sm text-ink-gray-4/70">{emptyText}</p>
                )}
            </div>
            {value && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            isIconButton
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(value, copyLabel)}
                            aria-label={_("Copy {0}", [copyLabel])}
                        >
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{_("Copy {0}", [copyLabel])}</TooltipContent>
                </Tooltip>
            )}
        </div>
    )
}
