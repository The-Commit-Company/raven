import { useFrappeGetCall } from 'frappe-react-sdk'
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { Poll } from '../chat-view/MessageBlock'
import { useState } from 'react'
import { peopleOutline } from 'ionicons/icons'
import { RetractVoteAction } from './RetractVoteAction'
import { ViewPollVotes } from '../../polls/ViewPollVotes'

export const PollActions = ({ message, onSuccess }: ActionProps) => {

    // fetch poll data using message_id
    const { data } = useFrappeGetCall<{ message: Poll }>('raven.api.raven_poll.get_poll', {
        'message_id': message?.name,
    }, `poll_data_${message?.poll_id}`, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false
    })

    if (data && data.message) {
        return <>
            {data.message.current_user_votes.length > 0 && <RetractVoteAction message={message} onSuccess={onSuccess} />}
            {data.message.poll.is_anonymous !== 1 && <ViewPollVotesAction poll={data.message} />}
        </>
    }

    return null
}

const ViewPollVotesAction = ({ poll }: { poll: Poll }) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <ActionItem onClick={() => setIsOpen(true)}>
                <ActionIcon icon={peopleOutline} />
                <ActionLabel label='View poll votes' />
            </ActionItem>
            <ViewPollVotes
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                poll={poll}
            />
        </>
    )
}