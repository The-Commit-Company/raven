import { useGetChannelData } from "@/hooks/useGetChannelData"
import { IonAlert, ToastOptions, useIonToast } from "@ionic/react"
import { useFrappeDeleteDoc, useFrappeGetCall } from "frappe-react-sdk"
import { UserContext } from "@/utils/auth/UserProvider"
import { useContext } from "react"
import { useHistory } from "react-router-dom"
import { ChannelListContext, ChannelListContextType } from "@/utils/channel/ChannelListProvider"

interface LeaveChannelModalProps {
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string
}

export const LeaveChannelAlert = ({ isOpen, onDismiss, channelID }: LeaveChannelModalProps) => {

    const { currentUser } = useContext(UserContext)

    const { data: channelMember } = useFrappeGetCall<{ message: { name: string } }>('frappe.client.get_value', {
        doctype: "Raven Channel Member",
        filters: JSON.stringify({ channel_id: channelID, user_id: currentUser }),
        fieldname: JSON.stringify(["name"])
    }, undefined, {
        revalidateOnFocus: false
    })

    const { mutate } = useContext(ChannelListContext) as ChannelListContextType

    const { channel } = useGetChannelData(channelID)

    const { deleteDoc, error } = useFrappeDeleteDoc()

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


    const leaveChannel = () => {
        deleteDoc('Raven Channel Member', channelMember?.message.name)
            .then(() => {
                presentToast("Channel left successfully.", 'success')
                onDismiss()
                mutate()
                history.replace('/channels')
            }).catch((e) => {
                presentToast("Couldn't leave the channel.", 'danger')
            })
    }

    return (
        <IonAlert onDidDismiss={onDismiss} isOpen={isOpen}
            header="Leave Channel"
            message={`Are you sure you want to leave #${channel?.channel_name}?`}
            buttons={[
                {
                    text: 'No',
                    role: 'cancel',
                }
                , {
                    text: 'Yes',
                    role: 'destructive',
                    cssClass: 'text-danger',
                    handler: leaveChannel
                }
            ]} />
    )
}