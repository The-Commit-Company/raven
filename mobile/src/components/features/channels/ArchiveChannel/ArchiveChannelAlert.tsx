import { useGetChannelData } from "@/hooks/useGetChannelData"
import { ChannelListContext, ChannelListContextType } from "@/utils/channel/ChannelListProvider"
import { IonAlert, ToastOptions, useIonToast } from "@ionic/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { useHistory } from "react-router-dom"

interface ArchiveChannelModalProps {
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string
}

export const ArchiveChannelAlert = ({ isOpen, onDismiss, channelID }: ArchiveChannelModalProps) => {

    const { channel } = useGetChannelData(channelID)

    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { updateDoc, error } = useFrappeUpdateDoc()
    const history = useHistory()

    const [present] = useIonToast()

    const presentToast = (message: string, color: ToastOptions['color']) => {
        present({
            message,
            duration: 1500,
            color,
            position: 'bottom',
        })
    }

    const archiveChannel = () => {
        updateDoc('Raven Channel', channel?.name ?? '', {
            is_archived: 1
        }).then(() => {
            presentToast("Channel archived successfully.", 'success')
            onDismiss()
            mutate()
            history.replace('/channels')
        }).catch((e) => {
            presentToast("Error while archiving the channel.", 'danger')
        })
    }

    return (
        <IonAlert onDidDismiss={onDismiss} isOpen={isOpen}
            header="Archive Channel"
            message={`Are you sure you want to archive #${channel?.channel_name}`}
            buttons={[
                {
                    text: 'No',
                    role: 'cancel',
                }
                , {
                    text: 'Yes',
                    role: 'confirm',
                    cssClass: 'text-danger',
                    handler: archiveChannel
                }
            ]} />
    )
}