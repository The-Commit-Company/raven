import { MessageBlock } from '../../../../../../types/Messaging/Message'
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from './common'
import { trashOutline } from 'ionicons/icons'
import { useFrappeDeleteDoc, useSWRConfig } from 'frappe-react-sdk'
import { useIonAlert, useIonToast } from '@ionic/react'

export const DeleteAction = ({ message, onSuccess }: ActionProps) => {

    const { deleteDoc } = useFrappeDeleteDoc()
    const { mutate } = useSWRConfig()

    const [presentAlert] = useIonAlert();

    const [present] = useIonToast();

    const deleteMessage = () => {
        deleteDoc('Raven Message', message.data.name)

            .then(() => {
                return present({
                    position: 'bottom',
                    color: 'success',
                    duration: 600,
                    message: 'Message deleted',
                })
            })
            .catch((e) => {
                console.log(e)
                present({
                    color: 'danger',
                    duration: 600,
                    message: "Error: Could not delete message",
                })
            })
            .then(() => mutate(`get_messages_for_channel_${message.data.channel_id}`))
            .then(() => onSuccess())


    }

    const openConfirmation = () => {
        presentAlert({
            header: "Delete Message",
            message: "Are you sure you want to delete this message?",
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                },
                {
                    text: "Delete",
                    role: 'destructive',
                    handler: () => {
                        console.log("Deleting Message", message)
                        deleteMessage()
                    }
                }
            ]
        })
    }

    return (
        <ActionItem onClick={openConfirmation}>
            <ActionIcon icon={trashOutline} />
            <ActionLabel label='Delete' />
        </ActionItem>
    )
}