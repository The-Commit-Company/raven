import React from "react"
import type { PollMessage } from "@raven/types/common/Message"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import { CheckCircle } from "lucide-react"
import { cn } from "@lib/utils"
import { GroupedAvatars } from "@components/ui/grouped-avatars"

export interface PollMessageProps {
    poll: RavenPoll & {
        options: (RavenPollOption & { voters?: { id: string; name: string; image: string }[] })[]
    }
    currentUserVotes: Array<{ option: string }>
}

const PollOptionBar = ({
    option,
    percentage,
    isCurrentUserVote
}: {
    option: RavenPollOption & { voters?: { id: string; name: string; image: string }[] }
    percentage: number
    isCurrentUserVote: boolean
}) => {
    // Show a minimal bar (2%) for 0 votes
    const barWidth = percentage > 0 ? percentage : 2
    return (
        <div className="relative flex items-center min-h-[1.25rem] rounded-md overflow-hidden group mb-1">
            <div className={"absolute top-0 left-0 h-full w-full transition-all duration-300 ease-in-out rounded-md"} />
            <div
                className={cn(
                    "absolute top-0 left-0 h-full bg-gray-100",
                    "transition-all duration-300 ease-in-out rounded-md"
                )}
                style={{ width: `${barWidth}%` }}
            />
            <div className="relative z-10 flex items-center flex-1 px-4 py-1.5 gap-2">
                <span className={cn("truncate text-[13px]", isCurrentUserVote ? "text-gray-900 font-medium" : "text-gray-700")}>{option.option}</span>
                {isCurrentUserVote && <CheckCircle className="w-3 h-3" />}
            </div>
            <div className="relative z-10 flex items-center gap-3 pr-4">
                {option.votes !== undefined && (
                    <span className="text-xs text-muted-foreground font-medium">
                        {option.votes} vote{option.votes === 1 ? "" : "s"} • <span className="text-[11px]">{percentage.toFixed(0)}%</span>
                    </span>
                )}
                {option.voters && option.voters.length > 0 && <GroupedAvatars users={option.voters} max={5} size="xs" />}
            </div>
        </div>
    )
}

const PollMessage: React.FC<PollMessageProps> = ({ poll, currentUserVotes }) => {
    return (
        <div className="w-full max-w-md bg-white border border-border/60 rounded-lg p-4 shadow-xs">
            {/* Poll Question */}
            <div className="font-medium mb-2 text-sm w-full">{poll.question}</div>
            {/* Poll Options */}
            <div className="flex flex-col gap-1 mb-2 w-full">
                {poll.options.map((option) => {
                    const totalVotes = poll.total_votes
                    const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0
                    const isCurrentUserVote = currentUserVotes.some((vote) => vote.option === option.name)
                    return (
                        <PollOptionBar
                            key={option.name}
                            option={option}
                            percentage={percentage}
                            isCurrentUserVote={isCurrentUserVote}
                        />
                    )
                })}
            </div>
            {/* Total votes */}
            <div className="flex items-center justify-start w-full">
                <span className="text-xs text-muted-foreground/80">Total votes: {poll.total_votes}</span>
            </div>
        </div>
    )
}

export default PollMessage 