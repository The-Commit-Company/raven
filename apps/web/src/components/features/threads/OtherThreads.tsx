import ThreadsList from './ThreadsList'
import { ThreadMessage } from '../../../types/ThreadMessage'

interface OtherThreadsProps {
    onThreadClick?: (thread: ThreadMessage) => void
    activeThreadID?: string
}

/**
 * Component for displaying other threads - where the user is not a member of the thread but is a member of the channel
 */
export default function OtherThreads({ onThreadClick, activeThreadID }: OtherThreadsProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <ThreadsList
                    threadType="other"
                    onThreadClick={onThreadClick}
                    activeThreadID={activeThreadID}
                />
            </div>
        </div>
    )
}
