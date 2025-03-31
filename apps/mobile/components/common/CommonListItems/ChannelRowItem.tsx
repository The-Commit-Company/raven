import { useColorScheme } from '@hooks/useColorScheme';
import { Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';

interface ChannelRowItemProps {
    channel: ChannelListItem
    onPress?: (channel: ChannelListItem) => void
}

const ChannelRowItem = ({ channel, onPress }: ChannelRowItemProps) => {

    const { colors } = useColorScheme()

    return (
        <Pressable
            onPress={() => onPress?.(channel)}
            className='flex flex-row gap-2 items-center px-2 py-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <ChannelIcon type={channel.type} fill={colors.icon} />
            <Text className="text-base">{channel.channel_name}</Text>
            {channel.is_archived ? (
                <View className='px-1 mt-0.5 py-0.5 rounded-sm bg-red-100'>
                    <Text className="text-[11px] text-red-700">Archived</Text>
                </View>
            ) : null}
        </Pressable>
    )
}

export default ChannelRowItem