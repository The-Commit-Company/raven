import { useGetChannelMembers } from "@/hooks/useGetChannelMembers"
import { UserContext } from "@/utils/auth/UserProvider"
import { IonItem, IonToggle, useIonToast } from "@ionic/react"
import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk"
import { useContext, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

export const ChannelPushNotificationToggle = () => {

    const { data } = useFrappeGetCall<{ message: boolean }>('raven.api.notification.are_push_notifications_enabled', undefined, undefined, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    if (data?.message) {
        return (
            <ToggleButton />
        )
    }

    return null
}

const ToggleButton = () => {

    const { channelID } = useParams<{ channelID: string }>()

    const { currentUser } = useContext(UserContext)

    const { channelMembers, mutate } = useGetChannelMembers(channelID)

    const { call } = useFrappePostCall('raven.api.notification.toggle_push_notification_for_channel')

    const { member, isNotificationEnabled } = useMemo(() => {
        const member = channelMembers?.find(member => member.name === currentUser)
        return {
            member,
            isNotificationEnabled: member?.allow_notifications
        }
    }, [channelMembers, currentUser])

    const [loading, setLoading] = useState(false)

    const [present] = useIonToast()

    const onToggle = () => {
        if (member && member.channel_member_name) {
            setLoading(true)
            call({
                member: member.channel_member_name,
                allow_notifications: isNotificationEnabled ? 0 : 1
            })
                .catch(() => {
                    present({
                        message: 'Failed to update notification settings',
                        duration: 1500,
                        color: 'danger',
                        position: 'bottom',
                    })
                })
                .then(() => mutate())
                .finally(() => setLoading(false))

        }
    }

    if (!member || !member.channel_member_name) {
        return null
    }



    return <IonItem color='light'>
        <IonToggle
            onIonChange={onToggle}
            disabled={loading}
            checked={isNotificationEnabled ? true : false}>
            Enable Push Notifications
        </IonToggle>
    </IonItem>
}