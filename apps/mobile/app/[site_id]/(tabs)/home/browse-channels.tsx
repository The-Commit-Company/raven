import { Link, router, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import SearchInput from '@components/common/SearchInput/SearchInput';
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon';
import useGetChannels from '@raven/lib/hooks/useGetChannels';
import { useState } from 'react';
import * as DropdownMenu from 'zeego/dropdown-menu';
import HashIcon from '@assets/icons/HashIcon.svg';
import GlobeIcon from '@assets/icons/GlobeIcon.svg';
import LockIcon from '@assets/icons/LockIcon.svg';
import FilterIcon from '@assets/icons/FilterIcon.svg';

export default function BrowseChannels() {

    const { colors } = useColorScheme()
    const { channels } = useGetChannels({ showArchived: true })
    const [searchQuery, setSearchQuery] = useState('')
    const [channelType, setChannelType] = useState('All')

    // Filter channels based on search query
    const filteredChannels = channels.filter(channel =>
        channel.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter channels based on channel type
    const filteredChannelsByType = filteredChannels.filter(channel => {
        if (channelType === 'All') return true
        return channel.type === channelType
    })

    return <>
        <Stack.Screen options={{
            title: 'Browse Channels',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className="flex-1 flex-col gap-2">
            <View className="flex flex-row items-center gap-2 px-3 pt-3">
                <View className="flex-1 max-w-[90%]">
                    <SearchInput
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                    />
                </View>
                <ChannelFilter channel={channelType} setChannel={setChannelType} />
            </View>
            <ScrollView className="px-1" contentContainerStyle={{ paddingBottom: 16 }}>
                {filteredChannelsByType.length > 0 ? (
                    filteredChannelsByType.map((channel) => (
                        <Pressable
                            key={channel.name}
                            onPress={() => {
                                router.back();
                                router.push(`../../chat/${channel.name}`);
                            }}
                            className='flex flex-row gap-2 items-center px-3 py-2 rounded-lg ios:active:bg-linkColor'
                            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                            <ChannelIcon type={channel.type} fill={colors.icon} />
                            <Text className="text-base">{channel.channel_name}</Text>
                            {channel.is_archived ?
                                <View className='px-1 mt-0.5 py-0.5 rounded-sm bg-red-100 dark:bg-red-900/40'>
                                    <Text className="text-[11px] text-red-700 dark:text-red-300">Archived</Text>
                                </View>
                                : null}
                        </Pressable>
                    ))
                ) : (
                    <Text className="px-3 py-2 text-sm text-muted-foreground">
                        No matching channels found
                    </Text>
                )}
            </ScrollView>
        </View>
    </>
}

const ChannelFilter = ({ channel, setChannel }: { channel: string, setChannel: (channel: string) => void }) => {
    const { colors } = useColorScheme()
    return <DropdownMenu.Root>
        <DropdownMenu.Trigger>
            <View className={`items-center p-2 border border-border rounded-md w-fit ${channel !== 'All' ? 'border-primary bg-primary/5' : ''}`}>
                {
                    channel === 'Public' ?
                        <HashIcon fill={colors.icon} height={18} width={18} />
                        : channel === 'Open' ?
                            <GlobeIcon fill={colors.icon} height={18} width={18} />
                            : channel === 'Private' ?
                                <LockIcon fill={colors.icon} height={18} width={18} />
                                : <FilterIcon color={colors.icon} height={18} width={18} />
                }
            </View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
            <DropdownMenu.Item key="All" onSelect={() => setChannel('All')}>
                <DropdownMenu.ItemTitle>Any Channel</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item
                key="open"
                textValue="Open"
                onSelect={() => setChannel('Open')}>
                <Text>Open</Text>
            </DropdownMenu.Item>
            <DropdownMenu.Item
                key="private"
                textValue="Private"
                onSelect={() => setChannel('Private')}>
                <Text>Private</Text>
            </DropdownMenu.Item>
            <DropdownMenu.Item
                key="public"
                textValue="Public"
                onSelect={() => setChannel('Public')}>
                <Text>Public</Text>
            </DropdownMenu.Item>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
}