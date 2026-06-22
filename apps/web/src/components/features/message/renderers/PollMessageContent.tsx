import { useMemo } from "react"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner"
import type { Message } from "@raven/types/common/Message"
import type { RavenPoll } from "@raven/types/RavenMessaging/RavenPoll"
import type { RavenPollOption } from "@raven/types/RavenMessaging/RavenPollOption"
import { useHasBeenInView } from "@hooks/useHasBeenInView"
import { getErrorMessage } from "@lib/frappe"
import _ from "@lib/translate"
import { PollVotingContainer } from "./PollVotingContainer"
import { PollQuestionHeader } from "./PollQuestionHeader"
import { SingleChoicePollVoting } from "./SingleChoicePollVoting"
import { MultiChoicePollVoting } from "./MultiChoicePollVoting"
import { PollOptionBar, getOptionPercentage, isUserVote, type PollOptionWithVoters } from "./poll-components"

type PollData = {
    poll: RavenPoll & { options: RavenPollOption[] }
    current_user_votes: { option: string; name: string }[]
}

/**
 * Parse the question + option texts straight from the poll message's `content`
 * (`question\n1. opt\n2. opt`, written by create_poll). Lets us render a full poll
 * skeleton with NO fetch — only the live data (option ids, vote counts, your vote,
 * the multi/anon/closed flags) needs get_poll.
 */
const parsePollContent = (content?: string | null) => {
    const lines = (content ?? "").split("\n").map((l) => l.trim()).filter(Boolean)
    return { question: lines[0] ?? "", options: lines.slice(1).map((l) => l.replace(/^\d+\.\s*/, "")) }
}

/**
 * A poll in the message stream. Content-only (the avatar/name/time come from the
 * message row). Renders a content-derived skeleton until the row scrolls into view,
 * then fetches the poll's live data — so a polls channel only fetches the polls the
 * user actually sees, not every windowed message.
 */
export const PollMessageContent = ({ message }: { message: Message }) => {
    const { ref, hasBeenInView } = useHasBeenInView()
    return (
        <div ref={ref}>
            {hasBeenInView ? <LoadedPoll message={message} /> : <PollSkeleton content={message.content} />}
        </div>
    )
}

const PollSkeleton = ({ content }: { content?: string | null }) => {
    const { question, options } = useMemo(() => parsePollContent(content), [content])
    return (
        <PollVotingContainer>
            <span className="mb-2 block text-sm font-medium text-ink-gray-7">{question}</span>
            <div className="flex flex-col gap-1">
                {options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-sm p-2 text-sm text-ink-gray-5">
                        <span className="size-4 shrink-0 rounded-full border border-outline-gray-3" />
                        <span className="min-w-0 flex-1 wrap-break-word">{option}</span>
                    </div>
                ))}
            </div>
        </PollVotingContainer>
    )
}

const LoadedPoll = ({ message }: { message: Message }) => {
    // Only mounted once the row is in view, so the fetch fires lazily.
    const { data, isLoading, mutate } = useFrappeGetCall<{ message: PollData }>(
        "raven.api.raven_poll.get_poll",
        { message_id: message.name },
        ["poll", message.name],
        { revalidateOnFocus: false },
    )
    const { call: addVote } = useFrappePostCall("raven.api.raven_poll.add_vote")

    // Show the same skeleton while the live data loads — height-stable, no flash.
    if (isLoading || !data) return <PollSkeleton content={message.content} />

    const { poll, current_user_votes } = data.message
    const hasVoted = current_user_votes.length > 0
    const showResults = hasVoted || poll.is_disabled === 1

    const submitVote = (optionIds: string[]) => {
        if (optionIds.length === 0) return
        addVote({ message_id: message.name, option_id: poll.is_multi_choice ? optionIds : optionIds[0] })
            .then(() => mutate())
            .catch((e) => toast.error(_("Could not record your vote"), { description: getErrorMessage(e) }))
    }

    return (
        <PollVotingContainer>
            <PollQuestionHeader poll={poll} className="mb-2" />
            {showResults ? (
                <>
                    <div className="mb-2 flex w-full flex-col gap-1">
                        {poll.options.map((option) => (
                            <PollOptionBar
                                key={option.name}
                                option={option as PollOptionWithVoters}
                                percentage={getOptionPercentage(option, poll)}
                                isCurrentUserVote={isUserVote(option.name, current_user_votes)}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-ink-gray-4/80">{_("Total votes: {0}", [String(poll.total_votes ?? 0)])}</span>
                </>
            ) : poll.is_multi_choice === 1 ? (
                <MultiChoicePollVoting poll={poll} options={poll.options} onSubmit={submitVote} />
            ) : (
                <SingleChoicePollVoting poll={poll} options={poll.options} onOptionSelect={(option) => submitVote([option.name])} />
            )}
        </PollVotingContainer>
    )
}
