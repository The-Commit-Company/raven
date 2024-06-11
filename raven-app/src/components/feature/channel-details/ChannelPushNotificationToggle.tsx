import { Member } from '@/hooks/fetchers/useFetchChannelMembers'
import useIsPushNotificationEnabled from '@/hooks/fetchers/useIsPushNotificationEnabled'
import { UserContext } from '@/utils/auth/UserProvider'

import { Box, Flex, Switch, Text } from '@radix-ui/themes'
import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { useContext } from 'react'
import { toast } from 'sonner'

type Props = {
    channelID: string,
    channelMember?: Member
}

const ChannelPushNotificationToggle = ({ channelID, channelMember }: Props) => {

    const { mutate } = useSWRConfig()

    const isPushAvailable = useIsPushNotificationEnabled()

    const { call } = useFrappePostCall('raven.api.notification.toggle_push_notification_for_channel')

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

    if (!channelMember) return null

    return (
        <Box className={'p-4 rounded-md border border-gray-6'}>
            <Flex justify={'between'}>
                <Flex direction={'column'} gap='1'>
                    <Text as="label" weight='medium' htmlFor='channel_push' size="2">
                        Push Notifications
                    </Text>
                    {isPushAvailable ? null :
                        <Text size='1' color='gray'>
                            Push notification is not enabled for the site. Please contact your administrator.
                        </Text>
                    }
                </Flex>
                <Flex gap="2">
                    <Switch size="2"
                        checked={channelMember.allow_notifications ? true : false}
                        id='channel_push'
                        onCheckedChange={onToggle}
                        disabled={!isPushAvailable} />
                </Flex>
            </Flex>
        </Box>
    )
}

export default ChannelPushNotificationToggle