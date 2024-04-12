import { useFrappePostCall } from 'frappe-react-sdk'
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { arrowUndoOutline } from 'ionicons/icons'
import { useIonToast } from '@ionic/react'

export const RetractVoteAction = ({ message, onSuccess }: ActionProps) => {

    const [present] = useIonToast()

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

    return (
        <ActionItem onClick={onRetractVote}>
            <ActionIcon icon={arrowUndoOutline} />
            <ActionLabel label='Retract vote' />
        </ActionItem>
    )
}