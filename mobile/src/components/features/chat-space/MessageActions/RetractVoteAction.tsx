import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { arrowUndoOutline } from 'ionicons/icons'
import { useIonToast } from '@ionic/react'
import { Poll } from '../chat-view/MessageBlock'

export const RetractVoteAction = ({ message, onSuccess }: ActionProps) => {

    const [present] = useIonToast()

    // fetch poll data using message_id
    const { data } = useFrappeGetCall<{ message: Poll }>('raven.api.raven_poll.get_poll', {
        'message_id': message?.name,
    }, `poll_data_${message?.poll_id}`, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false
    })

    const { call } = useFrappePostCall('raven.api.raven_poll.retract_vote')
    const onRetractVote = () => {
        return call({
            poll_id: message?.poll_id,
        }).then(() => {
            present({
                position: 'bottom',
                color: 'success',
                duration: 600,
                message: 'Vote retracted',
            })
            onSuccess()
        }).catch(() => {
            present({
                color: 'danger',
                duration: 600,
                message: "Error: Could not retract vote",
            })
        })
    }

    if (data && data.message?.current_user_votes.length > 0)
        return (
            <ActionItem onClick={onRetractVote}>
                <ActionIcon icon={arrowUndoOutline} />
                <ActionLabel label='Retract vote' />
            </ActionItem>
        )

    return null
}