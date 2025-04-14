import { useMemo, useCallback, useContext } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { FrappeConfig, FrappeContext, FrappeError, useSWRInfinite } from 'frappe-react-sdk'
import ErrorBanner from '@components/common/ErrorBanner'
import { ThreadMessage } from './ThreadTabs'
import ThreadsOutlineIcon from '@assets/icons/ThreadsOutlineIcon.svg'
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace'
import useUnreadThreadsCount from '@hooks/useUnreadThreadsCount'
import { LegendList } from '@legendapp/list'
import { useColorScheme } from "@hooks/useColorScheme"
import ThreadPreviewBox from './ThreadPreviewBox'

type Props = {
    /** Whether to fetch AI threads */
    aiThreads?: 0 | 1,
    /** Content to search for */
    content?: string,
    /** Channel to filter by */
    channel?: string,
    /** Endpoint to fetch threads from. Defaults to `raven.api.threads.get_all_threads` */
    endpoint?: string,
    /** Whether to only show unread threads */
    onlyShowUnread?: boolean
}

const PAGE_SIZE = 5

type GetThreadsReturnType = {
    message: ThreadMessage[]
}

type GetThreadsSWRKey = [string, {
    is_ai_thread: 0 | 1,
    workspace: string,
    content: string,
    channel_id: string,
    startAfter: number,
    onlyShowUnread: boolean
}]

const ThreadsList = ({ aiThreads, content, channel, endpoint = "raven.api.threads.get_all_threads", onlyShowUnread }: Props) => {

    const { workspace } = useGetCurrentWorkspace()

    const { data: unreadThreads } = useUnreadThreadsCount()

    const unreadThreadsMap = useMemo(() => {
        return unreadThreads?.message.reduce((acc, thread) => {
            acc[thread.name] = thread.unread_count
            return acc
        }, {} as Record<string, number>)
    }, [unreadThreads])

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { data, size, isLoading, setSize, error } = useSWRInfinite<GetThreadsReturnType, FrappeError>(
        (pageIndex, previousPageData) => {
            if (previousPageData && !previousPageData.message.length) return null
            const startAfter = pageIndex * PAGE_SIZE
            return [endpoint, {
                is_ai_thread: aiThreads,
                workspace: workspace,
                content: content,
                channel_id: channel,
                startAfter,
                onlyShowUnread
            }] // SWR key
        }, (swrKey: GetThreadsSWRKey) => {
            return call.get<GetThreadsReturnType>(endpoint, {
                is_ai_thread: swrKey[1].is_ai_thread,
                workspace: swrKey[1].workspace,
                content: swrKey[1].content,
                channel_id: swrKey[1].channel_id,
                start_after: swrKey[1].startAfter,
                limit: PAGE_SIZE,
                only_show_unread: swrKey[1].onlyShowUnread
            })
        }, {
        revalidateOnFocus: false,
        revalidateIfStale: true,
    })

    const isEmpty = data?.[0]?.message?.length === 0

    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.message?.length < PAGE_SIZE)

    const threads = data?.flatMap((page) => page.message) ?? []

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

    if (error) {
        return (
            <ErrorBanner error={error} />
        )
    }

    return (
        <LegendList
            data={threads ?? []}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
                <View role='listitem'>
                    <ThreadPreviewBox
                        thread={item}
                        unreadCount={unreadThreadsMap?.[item.name] ?? 0}
                    />
                </View>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
                <View className='flex flex-row justify-center items-center'>
                    {isLoadingMore && <ActivityIndicator />}
                </View>
            }
            contentContainerStyle={{
                paddingBottom: 64
            }}
            extraData={unreadThreadsMap}
            ListEmptyComponent={<EmptyStateForThreads isFiltered={onlyShowUnread} searchText={content} />}
            estimatedItemSize={250}
            style={{ flexGrow: 1 }}
        />
    )
}

const EmptyStateForThreads = ({ isFiltered = false, searchText }: { isFiltered?: boolean, searchText?: string }) => {

    const content = useMemo(() => {
        if (searchText && !isFiltered) {
            return {
                title: "No results found",
                description: `No threads match your search for "${searchText}". Try a different search term.`
            }
        } else if (isFiltered) {
            return {
                title: "You're all caught up",
                description: 'There are no unread threads to show. Clear the filter to see all threads.'
            }
        } else {
            return {
                title: 'No threads yet',
                description: 'Threads help keep conversations organized. Reply to any message to start a new thread or use the thread icon on messages to join existing discussions.'
            }
        }
    }, [isFiltered, searchText])

    const { colors } = useColorScheme()

    return (
        <View className="flex flex-col gap-2 bg-background p-4">
            <View className="flex flex-row items-center gap-2">
                <ThreadsOutlineIcon fill={colors.icon} height={20} width={20} />
                <Text className="text-foreground text-base font-medium">
                    {content.title}
                </Text>
            </View>
            <Text className="text-sm text-foreground/60">
                {content.description}
            </Text>
        </View>
    )
}

export default ThreadsList