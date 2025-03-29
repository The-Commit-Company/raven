import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { useColorScheme } from '@hooks/useColorScheme';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { FrappeConfig, FrappeContext, useSWRInfinite } from 'frappe-react-sdk';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { LegendList } from '@legendapp/list';
import AtSignIcon from '@assets/icons/AtSignIcon.svg';
import { useCallback, useContext, useMemo } from 'react';
import { RavenChannel } from '@raven/types/RavenChannelManagement/RavenChannel';
import { RavenMessage } from '@raven/types/RavenMessaging/RavenMessage';
import { getTimePassed } from '@raven/lib/utils/dateConversions';
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon';
import { BaseMessageItem } from '@components/features/chat-stream/BaseMessageItem';
import { Message } from '@raven/types/common/Message';
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import { useRouteToChannel } from '@hooks/useRouting';

interface MentionObject {
    /** ID of the message */
    name: string
    /** ID of the channel */
    channel_id: string
    /** Type of the channel */
    channel_type: RavenChannel['type']
    /** Name of the channel */
    channel_name: string
    /** Workspace name */
    workspace?: string
    /** Whether the channel is a thread */
    is_thread: 0 | 1
    /** Whether the channel is a direct message */
    is_direct_message: 0 | 1
    /** Date and time of the message */
    creation: string
    /** Type of the message */
    message_type: RavenMessage['message_type']
    /** Owner of the message */
    owner: string
    /** Text of the message */
    text: string
}

const PAGE_SIZE = 10

export default function Mentions() {

    const { colors } = useColorScheme()

    return <>
        <Stack.Screen options={{
            title: 'Mentions',
            headerStyle: { backgroundColor: colors.background },
            headerLeft: Platform.OS === 'ios' ? () => {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <ChevronLeftIcon color={colors.icon} />
                        </Button>
                    </Link>
                )
            } : undefined,
        }} />
        <View className='flex-1 bg-background'>
            <MentionsList />
        </View>
    </>
}

const MentionsList = () => {

    const { colors } = useColorScheme()

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { data, size, isLoading, setSize } = useSWRInfinite<{ message: MentionObject[] }>(
        (pageIndex: number, previousPageData: { message: MentionObject[] } | null) => {
            if (previousPageData && !previousPageData.message.length) return null
            const start = pageIndex * PAGE_SIZE
            return ['raven.api.mentions.get_mentions', {
                limit: PAGE_SIZE,
                start
            }] as const
        },
        ([endpoint, params]: readonly [string, { limit: number; start: number }]) => call.post(endpoint, params),
        {
            revalidateOnFocus: false,
            revalidateIfStale: true,
            revalidateOnMount: true
        }
    )

    const isEmpty = data?.[0]?.message?.length === 0
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.message?.length < PAGE_SIZE)
    const mentions = data?.flatMap((page: { message: MentionObject[] }) => page.message) ?? []

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize(size + 1)
        }
    }, [isReachingEnd, isLoadingMore, setSize, size])

    if (isLoading) {
        return <View className="flex-1 justify-center items-center h-full">
            <ActivityIndicator />
        </View>
    }

    return <LegendList
        data={mentions}
        ListEmptyComponent={<MentionsEmptyState />}
        renderItem={({ item }) => <MentionListItem message={item} />}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        onEndReached={loadMore}
        estimatedItemSize={300}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 64, backgroundColor: colors.background }}
    />
}

const MentionListItem = ({ message }: { message: MentionObject }) => {

    const goToChannel = useRouteToChannel()

    const handleNavigateToChannel = () => {
        goToChannel(message.channel_id, 'push', message.is_thread === 0 ? 'Channel' : 'Thread')
    }

    const channelName = useMemo(() => {

        if (message.is_thread) {
            return `Thread`
        }

        if (message.is_direct_message) {
            return ''
        }

        return message.channel_name
    }, [message])

    const { colors } = useColorScheme()

    return <Pressable
        className='pb-2 rounded-md ios:active:bg-linkColor ios:active:dark:bg-linkColor'
        onPress={handleNavigateToChannel}>
        <View>
            <View className='flex flex-row items-center px-3 pt-2 gap-2'>
                <View className='flex flex-row items-center gap-1'>
                    {message.is_thread === 0 && message.is_direct_message === 0 && <ChannelIcon type={message.channel_type} fill={colors.icon} size={16} />}
                    <Text className='text-sm'>{channelName}</Text>
                </View>
                <Text className='text-[13px] text-muted'>|</Text>
                <TimeStamp creation={message.creation} />
            </View>
            <BaseMessageItem message={message as unknown as Message} />
        </View>
    </Pressable>
}

const TimeStamp = ({ creation }: { creation: string }) => {
    return (
        <Text className="text-sm text-muted-foreground">{getTimePassed(creation)}</Text>
    )
}

const MentionsEmptyState = () => {
    const { colors } = useColorScheme()
    return (
        <View className="flex flex-col p-4 gap-2 bg-background">
            <View className="flex flex-row items-center gap-2">
                <AtSignIcon color={colors.icon} height={19} width={19} />
                <Text className="text-foreground text-base font-medium">No mentions yet</Text>
            </View>
            <Text className="text-sm text-foreground/60">
                When someone mentions you in a message, you'll see it here.
            </Text>
        </View>
    )
}