import { ThreadPreviewBox } from '../ThreadPreviewBox'
import { ThreadMessage } from '../Threads'
import { FrappeConfig, FrappeContext, FrappeError, useSWRInfinite } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { useParams } from 'react-router-dom'
import useUnreadThreadsCount from '@/hooks/useUnreadThreadsCount'
import { useContext, useMemo, useCallback, useRef, useEffect } from 'react'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import { Flex, Text } from '@radix-ui/themes'
import { LuListTree } from 'react-icons/lu'

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

    const { workspaceID } = useParams()

    const { data: unreadThreads } = useUnreadThreadsCount()

    const unreadThreadsMap = useMemo(() => {
        return unreadThreads?.message.reduce((acc, thread) => {
            acc[thread.name] = thread.unread_count
            return acc
        }, {} as Record<string, number>)
    }, [unreadThreads])

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { data, size, isLoading, setSize, error, mutate } = useSWRInfinite<GetThreadsReturnType, FrappeError>(
        (pageIndex, previousPageData) => {
            if (previousPageData && !previousPageData.message.length) return null
            const startAfter = pageIndex * PAGE_SIZE
            return [endpoint, {
                is_ai_thread: aiThreads,
                workspace: workspaceID,
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
    }
    )

    const isEmpty = data?.[0]?.message?.length === 0

    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.message?.length < PAGE_SIZE)

    const threads = useMemo(() => data?.flatMap((page) => page.message).sort((a, b) => new Date(b.last_message_timestamp).getTime() - new Date(a.last_message_timestamp).getTime()) ?? [], [data])

    useEffect(() => {
        const handleThreadUpdate = (event: CustomEvent) => {
            // Revalidate the thread reply count when we receive a thread update
            // Only update locally, do not refetch from the server
            mutate((d) => {

                if (!d) return d

                const mutatedData = d.map((page) => {
                    return {
                        ...page,
                        message: page.message.map((message) => {
                            if (message.name === event.detail.threadId) {
                                return { ...message, reply_count: event.detail.numberOfReplies, last_message_timestamp: event.detail.lastMessageTimestamp }
                            }
                            return message
                        })
                    }
                })

                return mutatedData

            }, {
                revalidate: false
            })
        }

        // Need to cast to any due to TypeScript's DOM event types
        window.addEventListener('thread_updated', handleThreadUpdate as any)

        return () => {
            window.removeEventListener('thread_updated', handleThreadUpdate as any)
        }
    }, [mutate])

    const observerTarget = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(() => {
        if (!isReachingEnd && !isLoadingMore) {
            setSize(size + 1)
        }
    }, [isReachingEnd, isLoadingMore, setSize, size])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [loadMore])

    if (error) {
        return <ErrorBanner error={error} />
    }

    if (isEmpty) {
        return <EmptyStateForThreads isFiltered={onlyShowUnread} />
    }

    return <ul className='list-none' role='list'>
        {threads.map((thread) => (
            <li key={thread.name} role='listitem'>
                <ThreadPreviewBox
                    thread={thread}
                    unreadCount={unreadThreadsMap?.[thread.name] ?? 0}
                />
            </li>
        ))}
        <div ref={observerTarget} className="h-4" />
        {isLoadingMore && <BeatLoader text='Loading more threads...' />}
    </ul>
}

const EmptyStateForThreads = ({ isFiltered = false }: { isFiltered?: boolean }) => {
    const content = useMemo(() => isFiltered ? {
        title: "You're all caught up",
        description: 'There are no unread threads to show. Clear the filter to see all threads.'
    } : {
        title: 'No threads yet',
        description: 'Threads help keep conversations organized. Reply to any message to start a new thread or use the thread icon on messages to join existing discussions.'
    }, [isFiltered])

    return (
        <Flex
            direction='column'
            align='center'
            justify='center'
            className='h-[400px] px-6 text-center'
        >
            <div className='text-gray-8 mb-4'>
                <LuListTree size={48} />
            </div>
            <Text size='5' weight='medium' className='mb-2'>
                {content.title}
            </Text>
            <Text as='p' size='2' color='gray' className='max-w-[400px]'>
                {content.description}
            </Text>
        </Flex>
    )
}

export default ThreadsList