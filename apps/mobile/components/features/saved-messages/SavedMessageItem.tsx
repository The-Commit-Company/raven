import { Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { Message } from '@raven/types/common/Message';
import { useMemo } from 'react';
import { DMChannelListItem } from '@raven/types/common/ChannelListItem';
import { useCurrentChannelData } from '@raven/lib/hooks/useCurrentChannelData';
import { useGetUserRecords } from '@raven/lib/hooks/useGetUserRecords';
import { formatDateAndTime } from '@raven/lib/utils/dateConversions';
import { BaseMessageItem } from '../chat-stream/BaseMessageItem';
import { useRouteToChannel } from '@hooks/useRouting';

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

    const goToChannel = useRouteToChannel()
    const handleNavigateToChannel = (channelID: string) => {
        goToChannel(channelID)
    }

    return (
        <Pressable
            className='pb-2 rounded-md ios:active:bg-linkColor ios:active:dark:bg-linkColor'
            onPress={() => handleNavigateToChannel(channel_id)}>
            <View>
                <View className='flex flex-row items-center px-3 pt-2 gap-2'>
                    <Text className='text-sm'>{channelName}</Text>
                    <Text className='text-[13px] text-muted'>|</Text>
                    <Text className='text-[13px] text-muted-foreground'>
                        {formatDateAndTime(creation)}
                    </Text>
                </View>
                <BaseMessageItem message={message} />
            </View>
        </Pressable>
    )
}

export default SavedMessageItem