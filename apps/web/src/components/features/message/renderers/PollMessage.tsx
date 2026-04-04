import React from "react"
import type { PollMessage } from "@raven/types/common/Message"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import { UserFields } from "@raven/types/common/UserFields"
import { UserAvatar } from "../UserAvatar"
import { useAtom } from "jotai"
import { pollDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { PollQuestionHeader } from "./PollQuestionHeader"
import { PollOptionBar, getOptionPercentage, isUserVote, type PollOptionWithVoters } from "./poll-components"

export interface PollMessageProps {
    user: UserFields
    poll: RavenPoll & {
        options: (RavenPollOption & { voters?: { id: string; name: string; image: string }[] })[]
    }
    currentUserVotes: Array<{ option: string }>
    time: string
    name: string
}

const PollMessage: React.FC<PollMessageProps> = ({ user, poll, currentUserVotes, time, name }) => {
    const channelID = useCurrentChannelID()
    const [, setPollDrawerData] = useAtom(pollDrawerAtom(channelID))

    const handleOpenDrawer = () => {
        setPollDrawerData({
            user,
            poll,
            currentUserVotes,
        })
    }

    return (
        <div className="flex items-start gap-3" data-message-id={name}>
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                    <span className="text-xs font-light text-muted-foreground/90">{time}</span>
                </div>

                <div
                    className="w-full max-w-md bg-card border border-border rounded-lg p-4 shadow-xs mt-1 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={handleOpenDrawer}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleOpenDrawer()
                        }
                    }}
                    aria-label="View poll details"
                >
                    {/* Poll Question with Badges */}
                    <PollQuestionHeader poll={poll} className="mb-2" />
                    {/* Poll Options */}
                    <div className="flex flex-col gap-1 mb-2 w-full">
                        {poll.options.map((option) => {
                            const percentage = getOptionPercentage(option, poll)
                            const isCurrentUserVote = isUserVote(option.name, currentUserVotes)
                            return (
                                <PollOptionBar
                                    key={option.name}
                                    option={option as PollOptionWithVoters}
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
            </div>
        </div>
    )
}

export default PollMessage 