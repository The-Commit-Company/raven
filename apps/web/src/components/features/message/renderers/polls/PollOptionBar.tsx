import React from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@lib/utils"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"

export interface PollOptionWithVoters extends RavenPollOption {
    voters?: { name: string; full_name: string; user_image?: string }[]
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
                <div className="absolute top-0 left-0 h-full w-full transition-all duration-300 ease-in-out rounded-md bg-surface-gray-2/60" />
                <div
                    className="absolute top-0 left-0 h-full bg-ink-gray-8/10 transition-all duration-300 ease-in-out rounded-md"
                    style={{ width: `${barWidth}%` }}
                />
                <div className="relative z-10 flex items-center flex-1 px-4 py-1.5 gap-2">
                    <span
                        className={cn(
                            "truncate text-sm",
                            isCurrentUserVote ? "text-ink-gray-8 font-medium" : "text-ink-gray-4"
                        )}
                    >
                        {option.option}
                    </span>
                    {isCurrentUserVote && <CheckCircle className="w-3 h-3 text-ink-gray-4" />}
                </div>
                <div className="relative z-10 flex items-center gap-3 pr-4">
                    {option.votes !== undefined && (
                        <span className="text-xs text-ink-gray-4 font-medium">
                            {option.votes} vote{option.votes === 1 ? "" : "s"} •{" "}
                            <span className="text-xs">{percentage.toFixed(0)}%</span>
                        </span>
                    )}
                    {showVoters && option.voters && option.voters.length > 0 && (
                        <GroupedAvatars users={option.voters} max={5} size="xs" borderColorClass="border-surface-base" />
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
                isCurrentUserVote ? "border-outline-blue-4/30 bg-surface-blue-5/3" : "border-transparent"
            )}
        >
            <div className="absolute top-0 left-0 h-full w-full transition-all duration-300 ease-in-out rounded-md bg-surface-gray-2/60" />
            <div
                className={cn(
                    "absolute top-0 left-0 h-full transition-all duration-300 ease-in-out rounded-md",
                    isCurrentUserVote ? "bg-surface-blue-5/10" : "bg-ink-gray-8/10"
                )}
                style={{ width: `${barWidth}%` }}
            />
            <div className="relative z-10 flex items-center flex-1 px-4 py-1.5 gap-2">
                <span
                    className={cn(
                        "truncate text-sm",
                        isCurrentUserVote ? "text-ink-gray-8 font-medium" : "text-ink-gray-4"
                    )}
                >
                    {option.option}
                </span>
                {isCurrentUserVote && <CheckCircle className="w-3 h-3 text-ink-gray-4" />}
            </div>
            <div className="relative z-10 flex items-center gap-3 pr-4">
                {option.votes !== undefined && (
                    <span className="text-xs text-ink-gray-4 font-medium">
                        {option.votes} vote{option.votes === 1 ? "" : "s"} •{" "}
                        <span className="text-xs">{percentage.toFixed(0)}%</span>
                    </span>
                )}
                {showVoters && option.voters && option.voters.length > 0 && (
                    <GroupedAvatars users={option.voters} max={5} size="xs" borderColorClass="border-surface-base" />
                )}
            </div>
        </div>
    )
}

