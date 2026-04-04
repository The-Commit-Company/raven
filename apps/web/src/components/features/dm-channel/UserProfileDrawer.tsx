import { Button } from "@components/ui/button"
import { ScrollArea } from "@components/ui/scroll-area"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip"
import { UserAvatar, getStatusIndicatorColor } from "@components/features/message/UserAvatar"
import { AtSign, Copy, Mail, Phone, X } from "lucide-react"
import { toast } from "sonner"
import type { UserFields } from "@raven/types/common/UserFields"

interface UserProfileDrawerProps {
    user: UserFields
    onClose: () => void
    email?: string
    phone?: string
    department?: string
    role?: string
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

export function UserProfileDrawer({ user, onClose, email, phone, department, role }: UserProfileDrawerProps) {
    const displayName = user.full_name ?? user.first_name ?? user.name ?? "Unknown"
    const availability = user.availability_status ?? ""
    const customStatus = user.custom_status?.trim() || ""
    const hasStatus = Boolean(availability || customStatus)
    const statusColor = user.availability_status ? getStatusIndicatorColor(user.availability_status) : ""

    const hasRoleOrDept = Boolean(role || department)
    const roleDeptLine = [role, department].filter(Boolean).join(" · ")

    return (
        <div className="flex flex-col h-full min-h-0 max-w-md w-[380px]">
            <div className="flex-1 min-h-0 overflow-hidden px-3 pt-4 pb-3">
                <ScrollArea className="h-full">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[15px] font-semibold text-foreground">Profile</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-2 shrink-0"
                            onClick={onClose}
                            aria-label="Close drawer"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="flex flex-col">
                {/* Avatar + name – centered, Slack-style */}
                <div className="px-4 pt-8 pb-6 flex flex-col items-center">
                    <UserAvatar
                        user={user}
                        size="xl"
                        showStatusIndicator={user.availability_status != null && user.availability_status !== "Invisible"}
                        showBotIndicator={false}
                    />
                    <h2 className="mt-4 text-[18px] font-bold text-foreground leading-tight text-center">
                        {displayName}
                    </h2>
                    {hasRoleOrDept && (
                        <p className="mt-0.5 text-[13px] font-semibold text-center text-muted-foreground">
                            {roleDeptLine}
                        </p>
                    )}
                    <p className={`flex items-center justify-center gap-1 text-[13px] font-normal text-muted-foreground ${hasRoleOrDept ? "mt-1" : "mt-0.5"}`}>
                        <AtSign className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                        <span>{formatUsername(user.name)}</span>
                    </p>
                </div>

                {/* Status – only render when there is a status or custom status */}
                {hasStatus && (
                    <div className="border-t border-border/50 px-4 py-3">
                        {user.availability_status && (
                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusColor}`}
                                    aria-hidden
                                />
                                <span className="text-[13px] font-normal text-foreground">{availability}</span>
                            </div>
                        )}
                        {customStatus && (
                            <p className={`text-[13px] font-normal text-muted-foreground ${user.availability_status ? "mt-1.5" : ""}`}>
                                {customStatus}
                            </p>
                        )}
                    </div>
                )}

                {/* Contact information – Slack: bold heading, icons in light rounded boxes */}
                <div className="border-t border-border/50 px-4 py-3">
                    <p className="text-[13px] font-bold text-foreground mb-3">
                        Contact information
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                <Mail className="h-4 w-4 text-foreground/90" strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[13px] font-normal text-muted-foreground">Email address</p>
                                    {email ? (
                                        <a
                                            href={`mailto:${email}`}
                                            className="text-[13px] font-normal text-primary hover:underline cursor-pointer block truncate"
                                        >
                                            {email}
                                        </a>
                                    ) : (
                                        <p className="text-[13px] font-normal text-muted-foreground/70">No email added</p>
                                    )}
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100 disabled:pointer-events-none"
                                                onClick={() => email && copyToClipboard(email, "Email")}
                                                disabled={!email}
                                                aria-label="Copy email"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {email ? "Copy email" : "No email to copy"}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                <Phone className="h-4 w-4 text-foreground/90" strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-[13px] font-normal text-muted-foreground">Phone</p>
                                    {phone ? (
                                        <a
                                            href={`tel:${phone}`}
                                            className="text-[13px] font-normal text-primary hover:underline cursor-pointer block truncate"
                                        >
                                            {phone}
                                        </a>
                                    ) : (
                                        <p className="text-[13px] font-normal text-muted-foreground/70">No phone number</p>
                                    )}
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100 disabled:pointer-events-none"
                                                onClick={() => phone && copyToClipboard(phone, "Phone number")}
                                                disabled={!phone}
                                                aria-label="Copy phone"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {phone ? "Copy phone number" : "No phone number to copy"}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </ScrollArea>
            </div>
        </div>
    )
}
