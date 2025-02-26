import { ThreadPreviewBox } from '../ThreadPreviewBox'
import { ThreadMessage } from '../Threads'
import { FrappeConfig, FrappeContext, FrappeError, useSWRInfinite } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyStateForThreads } from '@/components/layout/EmptyState/EmptyState'
import { useParams } from 'react-router-dom'
import useUnreadThreadsCount from '@/hooks/useUnreadThreadsCount'
import { useContext, useMemo, useCallback, useRef, useEffect } from 'react'
import BeatLoader from '@/components/layout/Loaders/BeatLoader'

type Props = {
    aiThreads?: 0 | 1,
    content?: string,
    channel?: string
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
    startAfter: number
}]

const ThreadsList = ({ aiThreads, content, channel }: Props) => {

    const { workspaceID } = useParams()

    const { data: unreadThreads } = useUnreadThreadsCount()

    const unreadThreadsMap = useMemo(() => {
        return unreadThreads?.message.reduce((acc, thread) => {
            acc[thread.name] = thread.unread_count
            return acc
        }, {} as Record<string, number>)
    }, [unreadThreads])

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { data, size, isLoading, setSize, error, isValidating } = useSWRInfinite<GetThreadsReturnType, FrappeError>(
        (pageIndex, previousPageData) => {
            if (previousPageData && !previousPageData.message.length) return null
            const startAfter = pageIndex * PAGE_SIZE
            return ["raven.api.threads.get_all_threads", {
                is_ai_thread: aiThreads,
                workspace: workspaceID,
                content: content,
                channel_id: channel,
                startAfter
            }] // SWR key
        }, (swrKey: GetThreadsSWRKey) => {
            return call.get<GetThreadsReturnType>("raven.api.threads.get_all_threads", {
                is_ai_thread: swrKey[1].is_ai_thread,
                workspace: swrKey[1].workspace,
                content: swrKey[1].content,
                channel_id: swrKey[1].channel_id,
                start_after: swrKey[1].startAfter,
                limit: PAGE_SIZE
            })
        }, {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        revalidateIfStale: false,
    }
    )

    const isEmpty = data?.[0]?.message?.length === 0

    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.message?.length < PAGE_SIZE)

    const threads = data?.flatMap((page) => page.message) ?? []

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
        return <EmptyStateForThreads />
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

export default ThreadsList