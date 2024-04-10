import { bookmarkOutline, trashOutline } from 'ionicons/icons'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useIonToast } from '@ionic/react'
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { useContext } from 'react'
import { UserContext } from '@/utils/auth/UserProvider'

export const SaveMessageAction = ({ message, onSuccess }: ActionProps) => {

    const { currentUser } = useContext(UserContext)
    const { mutate } = useSWRConfig()
    const { call, loading } = useFrappePostCall('frappe.desk.like.toggle_like')

    const [present] = useIonToast();

    const checkLiked = (likedBy: string) => {
        return JSON.parse(likedBy ?? '[]')?.length > 0 && JSON.parse(likedBy ?? '[]')?.includes(currentUser)
    }

    const isMessageLiked = checkLiked(message._liked_by)
    const handleLike = () => {

        const action = isMessageLiked ? 'No' : 'Yes'
        call({
            doctype: 'Raven Message',
            name: message.name,
            add: action
        })
            .then(() => {
                return present({
                    position: 'bottom',
                    color: 'success',
                    duration: 600,
                    message: `Message ${action === 'Yes' ? 'saved' : 'unsaved'}`,
                })
            })
            .catch((e) => {
                present({
                    color: 'danger',
                    duration: 600,
                    message: "We ran into an error.",
                })
            })
            .then(() => mutate(`get_messages_for_channel_${message.channel_id}`))
            .then(() => onSuccess())

    }
    return (
        <ActionItem onClick={handleLike} isLoading={loading}>
            <ActionIcon icon={bookmarkOutline} />
            <ActionLabel label={isMessageLiked ? 'Unsave' : 'Save'} />
        </ActionItem>
    )
}