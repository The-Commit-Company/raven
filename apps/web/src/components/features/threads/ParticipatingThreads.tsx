import ThreadsList from './ThreadsList'
import { UserFields } from '@raven/types/common/UserFields'
import { ThreadMessage } from '../../../types/ThreadMessage'

interface ParticipatingThreadsProps {
    threadType?: 'all' | 'participating'
    availableUsers?: UserFields[]
    onThreadClick?: (thread: ThreadMessage) => void
    activeThreadID?: string
}

/**
 * Component for displaying participating threads - where the user is a member of the thread
 */
export default function ParticipatingThreads({
    threadType = 'participating',
    onThreadClick,
    activeThreadID
}: ParticipatingThreadsProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <ThreadsList
                    threadType={threadType}
                    onThreadClick={onThreadClick}
                    activeThreadID={activeThreadID}
                />
            </div>
        </div>
    )
}
