import React from "react"
import { ScrollArea } from "@components/ui/scroll-area"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { X, MoreVertical, CheckCircle } from "lucide-react"
import { cn } from "@lib/utils"
import { UserAvatar } from "../UserAvatar"
import { getDateObject } from "@utils/date"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import type { UserFields } from "@raven/types/common/UserFields"

export interface PollDrawerProps {
    user: UserFields
    poll: RavenPoll & {
        options: (RavenPollOption & { voters?: { id: string; name: string; full_name?: string; image: string }[] })[]
    }
    currentUserVotes: Array<{ option: string }>
    onClose: () => void
}

export const PollDrawer: React.FC<PollDrawerProps> = ({
    user,
    poll,
    currentUserVotes,
    onClose,
}) => {
    const totalVotes = poll.total_votes || 0
    const isAnonymous = poll.is_anonymous === 1
    const isPollClosed = poll.is_disabled === 1
    const hasVoted = currentUserVotes.length > 0

    const badgeClassName = "bg-muted text-muted-foreground border-border"
    let pollStatusBadge: { text: string; className: string } | null = null

    if (isPollClosed) {
        pollStatusBadge = { text: "Closed", className: badgeClassName }
    } else if (poll.end_date) {
        try {
            const endDateObj = getDateObject(poll.end_date)
            const formattedDate = endDateObj.format('MMM D, hh:mm A')
            pollStatusBadge = { text: `Open until ${formattedDate}`, className: badgeClassName }
        } catch {
            pollStatusBadge = { text: "Open", className: badgeClassName }
        }
    } else {
        pollStatusBadge = { text: "Open", className: badgeClassName }
    }

    return (
        <div className="flex flex-col h-full max-w-md w-[380px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h2 className="text-sm font-medium">Poll</h2>
                    <span className="text-xs text-muted-foreground">
                        {totalVotes} vote{totalVotes === 1 ? "" : "s"}
                    </span>
                    {poll.is_multi_choice === 1 && (
                        <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">Multiple choice</span>
                        </>
                    )}
                    {isAnonymous && (
                        <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">Anonymous</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {pollStatusBadge && (
                        <Badge variant="outline" className={cn("text-[11px] px-2 py-0.5", pollStatusBadge.className)}>
                            {pollStatusBadge.text}
                        </Badge>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Poll settings"
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-48">
                            <DropdownMenuItem
                                disabled={!hasVoted || isPollClosed}
                            >
                                Retract my vote
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={onClose}
                        aria-label="Close drawer"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-3">
                <ScrollArea className="h-full">
                    <div className="px-1 space-y-2 pb-4">
                        {/* Poll Question */}
                        <p className="text-sm font-medium text-foreground py-1">{poll.question}</p>

                        {/* Poll Creator and Creation Time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2">
                            <UserAvatar
                                user={user}
                                size="xs"
                                showStatusIndicator={false}
                            />
                            <span>{user?.full_name || user?.name || "User"}</span>
                            <span>{poll.creation}</span>
                        </div>

                        {/* Poll Options */}
                        <div className="space-y-3">
                            {poll.options.map((option) => {
                                const optionVotes = option.votes || 0
                                const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0
                                const isCurrentUserVote = currentUserVotes.some(
                                    (vote) => vote.option === option.name
                                )
                                const optionWithVoters = option as typeof option & {
                                    voters?: { id: string; name: string; full_name?: string; image: string }[]
                                }
                                const showVoters = !isAnonymous && optionWithVoters.voters && optionWithVoters.voters.length > 0

                                return (
                                    <div
                                        key={option.name}
                                        className={cn(
                                            "p-3 border rounded-lg",
                                            isCurrentUserVote
                                                ? "border-blue-500/30 bg-blue-500/5"
                                                : "border-border/70"
                                        )}
                                    >
                                        <div className="space-y-3">
                                            {/* Option Header */}
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span
                                                        className={cn(
                                                            "text-sm font-medium truncate",
                                                            isCurrentUserVote ? "text-foreground" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {option.option}
                                                    </span>
                                                    {isCurrentUserVote && (
                                                        <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {optionVotes}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500 ease-out",
                                                        isCurrentUserVote ? "bg-primary" : "bg-primary/60"
                                                    )}
                                                    style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                                                />
                                            </div>

                                            {/* Voters List */}
                                            {showVoters && (
                                                <div className="pt-2 border-t">
                                                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                                        {optionWithVoters.voters?.map((voter) => (
                                                            <div
                                                                key={voter.id}
                                                                className="flex items-center gap-2 py-0.5"
                                                            >
                                                                <UserAvatar
                                                                    user={{
                                                                        name: voter.name,
                                                                        full_name: voter.full_name || voter.name,
                                                                        user_image: voter.image,
                                                                        type: "User",
                                                                        availability_status: "",
                                                                        custom_status: "",
                                                                        enabled: 1,
                                                                    }}
                                                                    size="xs"
                                                                    showStatusIndicator={false}
                                                                />
                                                                <span className="text-sm text-foreground">
                                                                    {voter.full_name || voter.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {isAnonymous && optionVotes > 0 && (
                                                <div className="text-xs text-muted-foreground italic pt-2 border-t">
                                                    {optionVotes} anonymous vote{optionVotes === 1 ? "" : "s"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
