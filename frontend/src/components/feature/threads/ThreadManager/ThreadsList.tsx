import { ThreadPreviewBox } from '../ThreadPreviewBox'
import { ThreadMessage } from '../Threads'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyStateForThreads } from '@/components/layout/EmptyState/EmptyState'
import { useParams } from 'react-router-dom'
import useUnreadThreadsCount from '@/hooks/useUnreadThreadsCount'
import { useMemo } from 'react'

type Props = {
    aiThreads?: 0 | 1,
    content?: string,
    channel?: string
}

const ThreadsList = ({ aiThreads, content, channel }: Props) => {

    const { workspaceID } = useParams()

    const { data: unreadThreads } = useUnreadThreadsCount()

    const unreadThreadsMap = useMemo(() => {
        return unreadThreads?.message.reduce((acc, thread) => {
            acc[thread.name] = thread.unread_count
            return acc
        }, {} as Record<string, number>)
    }, [unreadThreads])

    const { data, error } = useFrappeGetCall<{ message: ThreadMessage[] }>("raven.api.threads.get_all_threads", {
        is_ai_thread: aiThreads,
        workspace: workspaceID,
        content: content,
        channel_id: channel
    }, undefined, {
        revalidateOnFocus: false
    })

    if (error) {
        return <ErrorBanner error={error} />
    }

    if (data?.message?.length === 0) {
        return <EmptyStateForThreads />
    }

    return <ul className='list-none'>
        {data?.message?.map((thread) => {
            return <ThreadPreviewBox key={thread.name} thread={thread} unreadCount={unreadThreadsMap?.[thread.name] ?? 0} />
        })}
    </ul>

}

export default ThreadsList