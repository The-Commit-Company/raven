import React from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@lib/utils"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"

export interface PollOptionWithVoters extends RavenPollOption {
    voters?: { id: string; name: string; image: string; full_name?: string }[]
}

export interface PollOptionBarProps {
    option: PollOptionWithVoters
    percentage: number
    isCurrentUserVote: boolean
    showVoters?: boolean
    variant?: "default" | "compact"
}

/**
 * Shared component for displaying poll option results with progress bar, vote counts, and voter avatars.
 * Used in PollMessage, PollDrawer, and SearchResultsPolls.
 */
export const PollOptionBar: React.FC<PollOptionBarProps> = ({
    option,
    percentage,
    isCurrentUserVote,
    showVoters = true,
    variant = "default",
}) => {
    // Show a minimal bar (2%) for 0 votes
    const barWidth = percentage > 0 ? percentage : 2

    if (variant === "compact") {
        // Compact variant for search results (no progress bar)
        return (
            <div className="relative flex items-center min-h-5 rounded-md overflow-hidden group mb-1">
                <div className="absolute top-0 left-0 h-full w-full transition-all duration-300 ease-in-out rounded-md bg-muted/60" />
                <div
                    className="absolute top-0 left-0 h-full bg-primary/10 transition-all duration-300 ease-in-out rounded-md"
                    style={{ width: `${barWidth}%` }}
                />
                <div className="relative z-10 flex items-center flex-1 px-4 py-1.5 gap-2">
                    <span
                        className={cn(
                            "truncate text-[13px]",
                            isCurrentUserVote ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                    >
                        {option.option}
                    </span>
                    {isCurrentUserVote && <CheckCircle className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="relative z-10 flex items-center gap-3 pr-4">
                    {option.votes !== undefined && (
                        <span className="text-xs text-muted-foreground font-medium">
                            {option.votes} vote{option.votes === 1 ? "" : "s"} •{" "}
                            <span className="text-[11px]">{percentage.toFixed(0)}%</span>
                        </span>
                    )}
                    {showVoters && option.voters && option.voters.length > 0 && (
                        <GroupedAvatars users={option.voters} max={5} size="xs" borderColorClass="border-muted/60" />
                    )}
                </div>
            </div>
        )
    }

    // Default variant with progress bar (for PollMessage)
    return (
        <div
            className={cn(
                "relative flex items-center min-h-5 rounded-md overflow-hidden group mb-1 border",
                isCurrentUserVote ? "border-blue-500/30 bg-blue-500/3" : "border-transparent"
            )}
        >
            <div className="absolute top-0 left-0 h-full w-full transition-all duration-300 ease-in-out rounded-md bg-muted/60" />
            <div
                className={cn(
                    "absolute top-0 left-0 h-full transition-all duration-300 ease-in-out rounded-md",
                    isCurrentUserVote ? "bg-blue-500/10" : "bg-primary/10"
                )}
                style={{ width: `${barWidth}%` }}
            />
            <div className="relative z-10 flex items-center flex-1 px-4 py-1.5 gap-2">
                <span
                    className={cn(
                        "truncate text-[13px]",
                        isCurrentUserVote ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                >
                    {option.option}
                </span>
                {isCurrentUserVote && <CheckCircle className="w-3 h-3 text-muted-foreground" />}
            </div>
            <div className="relative z-10 flex items-center gap-3 pr-4">
                {option.votes !== undefined && (
                    <span className="text-xs text-muted-foreground font-medium">
                        {option.votes} vote{option.votes === 1 ? "" : "s"} •{" "}
                        <span className="text-[11px]">{percentage.toFixed(0)}%</span>
                    </span>
                )}
                {showVoters && option.voters && option.voters.length > 0 && (
                    <GroupedAvatars users={option.voters} max={5} size="xs" borderColorClass="border-muted/60" />
                )}
            </div>
        </div>
    )
}

