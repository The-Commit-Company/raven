import { ThreadPreviewBox } from './ThreadPreviewBox'
import { ThreadMessage } from './Threads'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { Flex } from '@radix-ui/themes'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { EmptyStateForThreads } from '@/components/layout/EmptyState/EmptyState'
import { useParams } from 'react-router-dom'

type Props = {
    aiThreads?: 0 | 1
}

const ThreadsList = ({ aiThreads }: Props) => {

    const { workspaceID } = useParams()

    const { data, error } = useFrappeGetCall<{ message: ThreadMessage[] }>("raven.api.threads.get_all_threads", {
        is_ai_thread: aiThreads,
        workspace: workspaceID
    }, undefined, {
        revalidateOnFocus: false
    })

    if (error) {
        return <ErrorBanner error={error} />
    }

    if (data?.message?.length === 0) {
        return <EmptyStateForThreads />
    }

    return <Flex direction='column' gap='3' justify='start' pt='2'>
        {data?.message?.map((thread) => {
            return <ThreadPreviewBox key={thread.name} thread={thread} />
        })}
    </Flex>

}

export default ThreadsList