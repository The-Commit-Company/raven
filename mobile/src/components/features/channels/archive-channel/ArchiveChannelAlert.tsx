import { useGetChannelData } from "@/hooks/useGetChannelData"
import { IonAlert } from "@ionic/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useHistory } from "react-router-dom"

interface ArchiveChannelModalProps {
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string
}

export const ArchiveChannelAlert = ({ isOpen, onDismiss, channelID }: ArchiveChannelModalProps) => {

    const { channel } = useGetChannelData(channelID)

    const { updateDoc, error } = useFrappeUpdateDoc()
    const history = useHistory()

    const archiveChannel = () => {
        console.log('archive channel')
        updateDoc('Raven Channel', channel?.name ?? '', {
            is_archived: 1
        }).then(() => {
            onDismiss()
            history.replace('/channel/general')
        }).catch((e) => {
            console.log(e)
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