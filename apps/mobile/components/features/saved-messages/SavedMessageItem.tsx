import { Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { FileMessage, ImageMessage, Message, PollMessage, TextMessage } from '@raven/types/common/Message';
import MessageItem from '@components/features/chat-stream/MessageItem';
import { useContext, useMemo } from 'react';
import { DMChannelListItem } from '@raven/types/common/ChannelListItem';
import { useCurrentChannelData } from '@raven/lib/hooks/useCurrentChannelData';
import { useGetUserRecords } from '@raven/lib/hooks/useGetUserRecords';
import { formatDateAndTime } from '@raven/lib/utils/dateConversions';
import { router } from 'expo-router';
import { SiteContext } from 'app/[site_id]/_layout';

type BaseMessage = FileMessage | TextMessage | ImageMessage | PollMessage

const SavedMessageItem = ({ message }: { message: Message & { workspace?: string } }) => {

    const { creation, channel_id } = message
    const users = useGetUserRecords()

    const { channel } = useCurrentChannelData(channel_id)
    const channelData = channel?.channelData

    const channelName = useMemo(() => {
        if (channelData) {
            if (channelData.is_direct_message) {
                const peer_user_name = users[(channelData as DMChannelListItem).peer_user_id]?.full_name ?? (channelData as DMChannelListItem).peer_user_id
                return `DM with ${peer_user_name}`
            } else {
                return channelData.channel_name
            }
        }
    }, [channelData])

    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename
    const handleNavigateToChannel = (channelID: string) => {
        router.push(`/${siteID}/chat/${channelID}`)
    }

    return (
        <Pressable
            className='rounded-lg pb-2 ios:active:bg-background ios:active:dark:bg-linkColor'
            onPress={() => handleNavigateToChannel(channel_id)}>
            <View className='flex flex-col justify-between'>
                <View className='flex flex-row items-center px-2 pt-2 gap-2'>
                    <Text className='text-xs'>{channelName}</Text>
                    <Text className='text-xs text-muted'>|</Text>
                    <Text className='text-xs text-muted-foreground'>
                        {formatDateAndTime(creation)}
                    </Text>
                </View>
                <View className='flex flex-row'>
                    <MessageItem message={message as BaseMessage} />
                </View>
            </View>
        </Pressable >
    )
}

export default SavedMessageItem