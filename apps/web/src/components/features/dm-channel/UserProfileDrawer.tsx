import { Button } from "@components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip"
import { UserAvatar, getStatusIndicatorColor } from "@components/features/message/UserAvatar"
import { AtSign, Copy, Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import type { UserData } from "@db"
import { useGetEmployee } from "@raven/lib/hooks/useGetEmployee"
import _ from "@lib/translate"

interface UserProfileDrawerProps {
    user: UserData
}

function formatUsername(name: string | undefined): string {
    if (!name?.trim()) return "No username"
    const s = name.trim()
    return s.startsWith("@") ? s : `${s}`
}

async function copyToClipboard(text: string, label: string) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    } catch {
        toast.error(`Failed to copy ${label}`)
    }
}

export function UserProfileDrawer({ user }: UserProfileDrawerProps) {
    const { employee } = useGetEmployee(user.name)
    const displayName = user.full_name ?? user.first_name ?? user.name ?? "Unknown"
    const availability = user.availability_status ?? ""
    const customStatus = user.custom_status?.trim() || ""
    const hasStatus = Boolean(availability || customStatus)
    const statusColor = user.availability_status ? getStatusIndicatorColor(user.availability_status) : ""

    const hasEmployeeInfo = Boolean(employee?.designation || employee?.department || employee?.team)
    const employeeInfo = [employee?.designation, employee?.department, employee?.team].filter(Boolean).join(" · ")

    return (
        <div className="flex flex-col">
            {/* Avatar + name – centered, Slack-style */}
            <div className="px-4 pt-8 pb-6 flex flex-col items-center">
                <UserAvatar
                    user={user}
                    size="xl"
                    showStatusIndicator={user.availability_status != null && user.availability_status !== "Invisible"}
                    showBotIndicator={false}
                />
                <h2 className="mt-4 text-[18px] font-bold text-ink-gray-8 leading-tight text-center">
                    {displayName}
                </h2>
                {hasEmployeeInfo && (
                    <p className="mt-0.5 text-sm font-semibold text-center text-ink-gray-4">
                        {employeeInfo}
                    </p>
                )}
                <p className={`flex items-center justify-center gap-1 text-sm font-normal text-ink-gray-4 ${hasEmployeeInfo ? "mt-1" : "mt-0.5"}`}>
                    <AtSign className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    <span>{formatUsername(user.name)}</span>
                </p>
            </div>

            {/* Status – only render when there is a status or custom status */}
            {hasStatus && (
                <div className="border-t border-outline-gray-2/50 px-4 py-3">
                    {user.availability_status && (
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusColor}`}
                                aria-hidden
                            />
                            <span className="text-sm font-normal text-ink-gray-8">{availability}</span>
                        </div>
                    )}
                    {customStatus && (
                        <p className={`text-sm font-normal text-ink-gray-4 ${user.availability_status ? "mt-1.5" : ""}`}>
                            {customStatus}
                        </p>
                    )}
                </div>
            )}

            {/* Contact information – Slack: bold heading, icons in light rounded boxes */}
            <div className="border-t border-outline-gray-2/50 px-4 py-3">
                <p className="text-sm font-bold text-ink-gray-8 mb-3">
                    {_("Contact information")}
                </p>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-gray-2">
                            <Mail className="h-4 w-4 text-ink-gray-8/90" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-sm font-normal text-ink-gray-4">{_("Email address")}</p>
                                {employee?.preferred_email ? (
                                    <a
                                        href={`mailto:${employee.preferred_email}`}
                                        className="text-sm font-normal text-primary hover:underline cursor-pointer block truncate"
                                    >
                                        {employee.preferred_email}
                                    </a>
                                ) : (
                                    <p className="text-sm font-normal text-ink-gray-4/70">{_("No email added")}</p>
                                )}
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            isIconButton
                                            className="shrink-0 opacity-70 hover:opacity-100"
                                            onClick={() => employee?.preferred_email && copyToClipboard(employee.preferred_email, "Email")}
                                            disabled={!employee?.preferred_email}
                                            aria-label="Copy email"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {employee?.preferred_email ? "Copy email" : "No email to copy"}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-gray-2">
                            <Phone className="h-4 w-4 text-ink-gray-8/90" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-sm font-normal text-ink-gray-4">{_("Phone")}</p>
                                {employee?.cell_number ? (
                                    <a
                                        href={`tel:${employee.cell_number}`}
                                        className="text-sm font-normal text-primary hover:underline cursor-pointer block truncate"
                                    >
                                        {employee.cell_number}
                                    </a>
                                ) : (
                                    <p className="text-sm font-normal text-ink-gray-4/70">{_("No phone number")}</p>
                                )}
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="inline-flex shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            isIconButton
                                            className="shrink-0 opacity-70 hover:opacity-100"
                                            onClick={() => employee?.cell_number && copyToClipboard(employee.cell_number, "Phone number")}
                                            disabled={!employee?.cell_number}
                                            aria-label="Copy phone"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {employee?.cell_number ? "Copy phone number" : "No phone number to copy"}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
