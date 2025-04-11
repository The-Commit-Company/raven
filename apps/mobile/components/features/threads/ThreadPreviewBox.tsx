import { Pressable, View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { ThreadMessage } from './ThreadTabs'
import { useGetUserRecords } from '@raven/lib/hooks/useGetUserRecords'
import { useCurrentChannelData } from '@hooks/useCurrentChannelData'
import { useMemo } from 'react'
import { DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { BaseMessageItem } from '../chat-stream/BaseMessageItem'
import { Message } from '@raven/types/common/Message'
import { formatDateAndTime } from '@raven/lib/utils/dateConversions'
import { ChannelIcon } from '../channels/ChannelList/ChannelIcon'
import { useColorScheme } from '@hooks/useColorScheme'
import ViewThreadParticipants from './ViewThreadParticipants'
import { Divider } from '@components/layout/Divider'
import { useRouteToThread } from '@hooks/useRouting'
import UnreadCountBadge from '@components/common/Badge/UnreadCountBadge'

const ThreadPreviewBox = ({ thread, unreadCount }: { thread: ThreadMessage, unreadCount?: number }) => {

    const users = useGetUserRecords()
    const { channel } = useCurrentChannelData(thread.channel_id)
    const channelData = channel?.channelData

    const channelDetails = useMemo(() => {
        if (channelData) {
            if (channelData.is_direct_message) {
                const peer_user_name = users[(channelData as DMChannelListItem).peer_user_id]?.full_name ?? (channelData as DMChannelListItem).peer_user_id
                return {
                    channelIcon: '',
                    channelName: `DM with ${peer_user_name}`
                }
            } else {
                return {
                    channelIcon: channelData.type,
                    channelName: channelData.channel_name
                }
            }
        } else {
            return {
                channelIcon: '',
                channelName: 'Deleted Channel'
            }
        }
    }, [channelData, users])

    const routeToThread = useRouteToThread()

    const handleNavigateToThread = () => {
        routeToThread(thread.name)
    }

    const { colors } = useColorScheme()

    return (
        <View className='flex flex-col'>
            <Pressable
                className='pt-3 pb-3.5 active:bg-linkColor active:dark:bg-linkColor'
                onPress={handleNavigateToThread}>
                <View>
                    <View className='flex flex-row px-3 items-center justify-between'>
                        <View className={`flex flex-row items-center gap-2`}>
                            <View className='flex flex-row items-center gap-1'>
                                {channelDetails?.channelIcon && <ChannelIcon type={channelDetails?.channelIcon as "Private" | "Public" | "Open"} fill={colors.icon} size={14} />}
                                <Text className='text-sm'>{channelDetails?.channelName}</Text>
                            </View>
                            <Text className='text-[13px] text-muted'>|</Text>
                            <Text className='text-[13px] text-muted-foreground'>
                                {formatDateAndTime(thread.creation)}
                            </Text>
                        </View>
                        {unreadCount && unreadCount > 0 ? <UnreadCountBadge count={unreadCount} prominent /> : null}
                    </View>
                    <BaseMessageItem message={thread as unknown as Message} />
                    <View className='flex flex-row items-center gap-2 pl-16 pt-2'>
                        <ViewThreadParticipants participants={thread.participants ?? []} />
                        <Text className={'text-sm font-medium text-primary dark:text-secondary'}>{thread.reply_count ?? 0} {thread.reply_count && thread.reply_count === 1 ? 'Reply' : 'Replies'}</Text>
                    </View>
                </View>
            </Pressable>
            <Divider prominent />
        </View>
    )
}

export default ThreadPreviewBox