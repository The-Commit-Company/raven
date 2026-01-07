import React from "react"
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group"
import { cn } from "@lib/utils"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import { PollVoteCount, getOptionPercentage, getPollStatus } from "./poll-components"
import type { PollOptionWithVoters } from "./poll-components"

export interface SingleChoicePollVotingProps {
    poll: RavenPoll
    options: (RavenPollOption & { voters?: { id: string; name: string; image: string }[] })[]
    className?: string
    onOptionSelect?: (option: RavenPollOption) => void
}

export const SingleChoicePollVoting: React.FC<SingleChoicePollVotingProps> = ({
    poll,
    options,
    className,
    onOptionSelect,
}) => {
    const isDisabled = poll.is_disabled === 1

    const handleValueChange = (value: string) => {
        if (!isDisabled && onOptionSelect) {
            const selectedOption = options.find((opt) => opt.name === value)
            if (selectedOption) {
                onOptionSelect(selectedOption)
            }
        }
    }

    const { isAnonymous } = getPollStatus(poll)
    const totalVotes = poll.total_votes || 0

    return (
        <RadioGroup
            disabled={isDisabled}
            onValueChange={handleValueChange}
            className={cn("flex flex-col gap-1", className)}
        >
            {options.map((option) => {
                const percentage = getOptionPercentage(option, poll)
                const optionWithVoters = option as PollOptionWithVoters

                return (
                    <label
                        key={option.name}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-sm w-full cursor-pointer transition-colors",
                            !isDisabled && "hover:bg-muted"
                        )}
                    >
                        <RadioGroupItem
                            value={option.name}
                            disabled={isDisabled}
                            className="shrink-0"
                        />
                        <span className="text-[13px] text-foreground wrap-break-word flex-1 min-w-0">
                            {option.option}
                        </span>
                        {!isAnonymous && totalVotes > 0 && (
                            <PollVoteCount
                                votes={option.votes || 0}
                                percentage={percentage}
                                voters={optionWithVoters.voters}
                            />
                        )}
                    </label>
                )
            })}
        </RadioGroup>
    )
}

