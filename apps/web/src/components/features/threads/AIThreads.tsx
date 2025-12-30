import ThreadsList from './ThreadsList'
import { ThreadMessage } from '../../../types/ThreadMessage'

interface AIThreadsProps {
    onThreadClick?: (thread: ThreadMessage) => void
    activeThreadID?: string
}

/**
 * Component for displaying AI threads - these are all DMs with the AI
 */
export default function AIThreads({ onThreadClick, activeThreadID }: AIThreadsProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                <ThreadsList
                    threadType="ai"
                    aiThreads={1}
                    onThreadClick={onThreadClick}
                    activeThreadID={activeThreadID}
                />
            </div>
        </div>
    )
}
