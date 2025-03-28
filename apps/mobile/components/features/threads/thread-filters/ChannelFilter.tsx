import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import * as DropdownMenu from 'zeego/dropdown-menu';
import useGetChannels from '@raven/lib/hooks/useGetChannels';
import HashIcon from '@assets/icons/HashIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';

const ChannelFilter = ({ channel, setChannel }: { channel: string, setChannel: (channel: string) => void }) => {

    const { channels } = useGetChannels({ showArchived: false })
    const { colors } = useColorScheme()

    return (
        <View>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <View className={`items-center p-2 border border-border rounded-lg w-fit ${channel !== 'all' ? 'border-primary bg-primary/5' : ''}`}>
                        <HashIcon fill={colors.icon} height={18} width={18} />
                    </View>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content side='bottom' align='end'>
                    <DropdownMenu.Item key="all" onSelect={() => setChannel('all')}>
                        <DropdownMenu.ItemTitle>Any Channel</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    {channels.map((channelItem) => (
                        <DropdownMenu.Item
                            key={channelItem.name}
                            textValue={channelItem.channel_name}
                            onSelect={() => setChannel(channelItem.name)}>
                            <Text>{channelItem.channel_name}</Text>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </View>
    )
}

export default ChannelFilter