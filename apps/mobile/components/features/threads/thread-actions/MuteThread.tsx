import { Member } from '@raven/lib/hooks/useFetchChannelMembers'
import useIsPushNotificationEnabled from '@raven/lib/hooks/useIsPushNotificationEnabled'
import { useLocalSearchParams } from 'expo-router'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { toast } from 'sonner-native'
import * as DropdownMenu from 'zeego/dropdown-menu'

const MuteThread = ({ channelMember }: { channelMember: Member }) => {

    const { id: threadID } = useLocalSearchParams()
    const { mutate } = useSWRConfig()

    const isPushAvailable = useIsPushNotificationEnabled()
    const { call } = useFrappePostCall('raven.api.notification.toggle_push_notification_for_channel')

    const onToggle = () => {
        if (channelMember) {
            call({
                member: channelMember?.channel_member_name,
                allow_notifications: channelMember?.allow_notifications ? 0 : 1
            }).then((res) => {
                if (res && res.message) {
                    mutate(["channel_members", threadID], (existingMembers: any) => {
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

                toast.success(`Thread ${channelMember?.allow_notifications ? 'muted' : 'unmuted'}`)
            })
        }
    }

    if (!isPushAvailable) return null

    return (
        <DropdownMenu.Item key="disable-notifications" onSelect={onToggle}>
            <DropdownMenu.ItemIcon ios={{
                name: channelMember?.allow_notifications ? 'bell.slash' : 'bell',
                pointSize: 16,
                scale: 'medium',
                hierarchicalColor: {
                    dark: 'white',
                    light: 'black',
                },
            }} />
            <DropdownMenu.ItemTitle>
                {channelMember?.allow_notifications ? 'Unmute' : 'Mute'}
            </DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
    )
}

export default MuteThread