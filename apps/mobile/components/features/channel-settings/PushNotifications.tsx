import { View } from 'react-native';
import { useMemo } from 'react';
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import useIsPushNotificationEnabled from '@raven/lib/hooks/useIsPushNotificationEnabled'
import { useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { Toggle } from '@components/nativewindui/Toggle'
import { Text } from '@components/nativewindui/Text';
import { toast } from 'sonner-native';

interface PushNotifications {
    channelID: string
}

const PushNotifications = ({ channelID }: PushNotifications) => {

    const { mutate } = useSWRConfig()

    const isPushAvailable = useIsPushNotificationEnabled()

    const { call } = useFrappePostCall('raven.api.notification.toggle_push_notification_for_channel')

    const { channelMembers } = useFetchChannelMembers(channelID ?? "")

    const { myProfile: currentUserInfo } = useCurrentRavenUser()

    const { channelMember, isAdmin } = useMemo(() => {
        const channelMember = channelMembers[currentUserInfo?.name ?? ""]
        return {
            channelMember,
            isAdmin: channelMember?.is_admin == 1
        }
    }, [channelMembers, currentUserInfo])

    const onToggle = () => {
        if (channelMember) {
            call({
                member: channelMember?.channel_member_name,
                allow_notifications: channelMember?.allow_notifications ? 0 : 1
            })
                .then((res) => {
                    if (res && res.message) {
                        mutate(["channel_members", channelID], (existingMembers: any) => {
                            return {
                                message: {
                                    ...existingMembers.message,
                                    [channelMember.name]: {
                                        ...existingMembers.message[channelMember.name],
                                        allow_notifications: res.message.allow_notifications
                                    }
                                }
                            }
                        }, {
                            revalidate: false
                        })
                    }
                })
                .catch(() => {
                    toast.error('Failed to update notification settings')
                })
        }
    }

    return (
        <View className='mt-3'>
            <View className='p-3 bg-card rounded-lg flex-row justify-between items-center'>
                <Text>Push Notifications</Text>
                <Toggle value={channelMember?.allow_notifications ? true : false} onValueChange={onToggle} disabled={!isPushAvailable} />
            </View>
        </View>
    )
}

export default PushNotifications