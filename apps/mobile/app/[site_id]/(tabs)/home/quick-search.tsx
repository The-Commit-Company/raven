import { Link, router, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { Pressable, View, StyleSheet, ScrollView } from 'react-native';
import { SearchInput } from '@components/nativewindui/SearchInput';
import { Text } from '@components/nativewindui/Text';
import HashIcon from '@assets/icons/HashIcon.svg';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import UserIcon from '@assets/icons/UserIcon.svg';
import useGetChannels from '@raven/lib/hooks/useGetChannels';
import useGetDirectMessageChannels from '@raven/lib/hooks/useGetDirectMessageChannels';
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import UserAvatar from '@components/layout/UserAvatar';
import { useState } from 'react';
import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem';

export default function QuickSearch() {

    const { colors } = useColorScheme()

    const openMenuItemSheet = (url: string) => {
        router.back()
        router.push(url, { relativeToDirectory: false })
    }

    const [searchQuery, setSearchQuery] = useState('')

    const { channels } = useGetChannels({ showArchived: true })
    const { dmChannels } = useGetDirectMessageChannels()

    // Filter channels based on search query
    const filteredChannels = channels.filter(channel =>
        channel.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filter direct messages based on search query
    const filteredDms = dmChannels.filter(dm => {
        const user = useGetUser(dm.peer_user_id);
        return (
            (user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })

    return <>
        <Stack.Screen options={{
            title: 'Quick search',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon fill={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className="flex flex-col gap-3 p-3">
            <View>
                <SearchInput
                    autoFocus
                    style={{ backgroundColor: colors.grey5 }}
                    placeholder="Search"
                    iconColor={colors.destructive}
                    placeholderTextColor={colors.grey}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            </View>
            <View className='flex flex-row justify-center gap-2'>
                <Pressable style={styles.button} className='ios:active:bg-linkColor bg-card'
                    onPress={() => openMenuItemSheet('../home/browse-channels')}>
                    <HashIcon fill={colors.grey} height={20} width={20} />
                    <Text className='text-sm text-muted-foreground'>View channels</Text>
                </Pressable>
                <Pressable style={styles.button} className='ios:active:bg-linkColor bg-card'
                    onPress={() => openMenuItemSheet('../home/create-dm')}>
                    <UserIcon fill={colors.grey} height={20} width={20} />
                    <Text className='text-sm text-muted-foreground'>Open a DM</Text>
                </Pressable>
                <Pressable style={styles.button} className='ios:active:bg-linkColor bg-card'
                    onPress={() => openMenuItemSheet('../home/create-channel')}>
                    <PlusIcon fill={colors.grey} height={20} width={20} />
                    <Text className='text-sm text-muted-foreground'>New channel</Text>
                </Pressable>
            </View>
            <ScrollView className='h-[64vh]' contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                <View className='flex flex-col gap-2'>
                    <Channels channels={filteredChannels} />
                    <Dms dmChannels={filteredDms} />
                </View>
            </ScrollView>
        </View>
    </>
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 17,
        alignItems: 'center'
    }
})

const Channels = ({ channels }: { channels: ChannelListItem[] }) => {
    const colors = useColorScheme();
    return (
        <View>
            <Text className='text-xs px-3 py-1 text-muted-foreground'>Channels</Text>
            {channels.length > 0 ? (
                channels.map((channel) => (
                    <Pressable
                        key={channel.name}
                        onPress={() => {
                            router.back();
                            router.push(`../../chat/${channel.name}`);
                        }}
                        className='flex-row items-center px-3 py-2 rounded-lg ios:active:bg-linkColor'
                        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                        <ChannelIcon type={channel.type} fill={colors.colors.icon} />
                        <Text className="ml-2 text-base">{channel.channel_name}</Text>
                    </Pressable>
                ))
            ) : (
                <Text className="px-3 py-2 text-sm text-muted-foreground">
                    No matching channels found
                </Text>
            )}
        </View>
    )
}

const Dms = ({ dmChannels }: { dmChannels: DMChannelListItem[] }) => {
    return (
        <View>
            <Text className='text-xs px-3 py-1 pb-2 text-muted-foreground'>Direct Messages</Text>
            {dmChannels.length > 0 ? (
                dmChannels.map((dm) => {
                    const user = useGetUser(dm.peer_user_id);
                    return (
                        <Pressable
                            key={dm.name}
                            onPress={() => {
                                router.back();
                                router.push(`../../chat/${dm.name}`);
                            }}
                            className='flex-row items-center px-3 py-1.5 rounded-lg ios:active:bg-linkColor'
                            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                            <UserAvatar src={user?.user_image} alt={user?.full_name ?? user?.name ?? ''} avatarProps={{ className: 'h-8 w-8' }} />
                            <Text className='ml-2 text-base'>{user?.full_name}</Text>
                        </Pressable>
                    );
                })
            ) : (
                <Text className="px-3 py-2 text-sm text-muted-foreground">
                    No matching direct messages found
                </Text>
            )}
        </View>
    )
}