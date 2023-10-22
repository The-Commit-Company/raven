import { createOutline } from "ionicons/icons"
import { ActionIcon, ActionItem, ActionLabel, ActionProps } from "./common"
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { useIonToast } from "@ionic/react"

export const EditMessageAction = ({ message, onSuccess }: ActionProps) => {
    return <EditMessageActionItem message={message} onSuccess={onSuccess} />
}

export const EditMessageActionItem = ({ message, onSuccess }: ActionProps) => {

    const { updateDoc, loading } = useFrappeUpdateDoc()
    const { mutate } = useSWRConfig()

    const [present] = useIonToast()

    const editMessage = async (html: string, json: any) => {
        updateDoc('Raven Message', message.data.name,
            { text: html, json }).then((d) => {
                return present({
                    position: 'bottom',
                    color: 'success',
                    duration: 600,
                    message: 'Message updated',
                })
            }).catch((e) => {
                console.log(e)
                present({
                    color: 'danger',
                    duration: 600,
                    message: "Error: Could not update message",
                })
            })
            .then(() => mutate(`get_messages_for_channel_${message.data.channel_id}`))
            .then(() => onSuccess())
    }

    return (
        <ActionItem isLoading={loading}>
            <ActionIcon icon={createOutline} />
            <ActionLabel label='Edit' />
        </ActionItem>
    )
}