import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import * as DropdownMenu from 'zeego/dropdown-menu';
import useGetChannels from '@raven/lib/hooks/useGetChannels';
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon';

const ChannelFilter = ({ channel, setChannel }: { channel: string, setChannel: (channel: string) => void }) => {

    const { channels } = useGetChannels({ showArchived: false })

    return (
        <View>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Text className='text-base text-muted-foreground/80'>
                        {channel === 'all' ? 'Any Channel' : channel}
                    </Text>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content side='bottom' align='end'>
                    <DropdownMenu.Item key="all" onSelect={() => setChannel('all')}>
                        <DropdownMenu.ItemTitle>Any Channel</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    {channels.map((channelItem) => (
                        <DropdownMenu.Item
                            key={channelItem.name}
                            onSelect={() => setChannel(channelItem.name)}>
                            <View className='flex flex-row items-center gap-2'>
                                <ChannelIcon type={channelItem.type} />
                                <Text>{channelItem.channel_name}</Text>
                            </View>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </View>
    )
}

export default ChannelFilter