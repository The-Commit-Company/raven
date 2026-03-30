import React from "react"
import { UserAvatar } from "../UserAvatar"
import type { UserFields } from "@raven/types/common/UserFields"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import {
    PollVotingContainer,
    PollQuestionHeader,
    SingleChoicePollVoting,
    MultiChoicePollVoting,
} from "./poll-components"

export interface PollVotingMessageProps {
    user: UserFields
    poll: RavenPoll
    options: (RavenPollOption & { voters?: { id: string; name: string; image: string }[] })[]
    time: string
    name: string
    onOptionSelect?: (option: RavenPollOption) => void
    onOptionToggle?: (optionId: string, checked: boolean) => void
    onSubmit?: (selectedOptionIds: string[]) => void
}

export const PollVotingMessage: React.FC<PollVotingMessageProps> = ({
    user,
    poll,
    options,
    time,
    name,
    onOptionSelect,
    onOptionToggle,
    onSubmit,
}) => {
    return (
        <div className="flex items-start gap-3" data-message-id={name}>
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                    <span className="text-xs font-light text-muted-foreground/90">{time}</span>
                </div>
                <div className="mt-1">
                    <PollVotingContainer>
                        <PollQuestionHeader poll={poll} className="mb-2" />
                        {poll.is_multi_choice === 1 ? (
                            <MultiChoicePollVoting
                                poll={poll}
                                options={options}
                                onOptionToggle={onOptionToggle}
                                onSubmit={onSubmit}
                            />
                        ) : (
                            <SingleChoicePollVoting
                                poll={poll}
                                options={options}
                                onOptionSelect={onOptionSelect}
                            />
                        )}
                    </PollVotingContainer>
                </div>
            </div>
        </div>
    )
}

