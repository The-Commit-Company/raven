import React from "react"
import { Badge } from "@components/ui/badge"
import { cn } from "@lib/utils"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import { getDateObject } from "@utils/date"

export interface PollQuestionHeaderProps {
    poll: RavenPoll
    className?: string
}

export const PollQuestionHeader: React.FC<PollQuestionHeaderProps> = ({ poll, className }) => {
    const isAnonymous = poll.is_anonymous === 1
    const isDisabled = poll.is_disabled === 1

    const formatEndDate = () => {
        if (!poll.end_date) return null
        try {
            return getDateObject(poll.end_date).format("MMM D, YYYY, hh:mm A")
        } catch {
            return "a future date"
        }
    }

    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm text-card-foreground flex-1 min-w-0">
                    {poll.question}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isAnonymous && (
                        <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                            Anonymous
                        </Badge>
                    )}
                    {isDisabled && (
                        <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                            Closed
                        </Badge>
                    )}
                </div>
            </div>
            {poll.end_date && !isDisabled && formatEndDate() && (
                <span className="text-xs text-muted-foreground/80">
                    This poll will end on {formatEndDate()}.
                </span>
            )}
        </div>
    )
}

