import { useFrappeGetCall } from 'frappe-react-sdk'
import { useParams } from 'react-router-dom'

export type UnreadThread = { name: string, unread_count: number }
const useUnreadThreadsCount = () => {

    const { workspaceID } = useParams()

    return useFrappeGetCall<{ message: UnreadThread[] }>('raven.api.threads.get_unread_threads', {
        workspace: workspaceID
    }, ["unread_thread_count", workspaceID])

}

export default useUnreadThreadsCount