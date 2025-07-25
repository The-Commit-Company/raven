import { Hash } from "lucide-react"
import { UserAvatar } from "../UserAvatar"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import type { UserFields } from "@raven/types/common/UserFields"

export default function ThreadMessage({
    user,
    message,
    time,
    threadTitle,
    participants = [],
    messageCount = 3,
}: {
    user: UserFields
    message: string
    time: string
    threadSummary: string
    threadTitle: string
    participants?: UserFields[]
    messageCount?: number
}) {
    const displayName = user?.full_name || user?.name || "User"

    return (
        <div>
            {/* Thread Header Section */}
            <ThreadHeader
                displayName={displayName}
                threadTitle={threadTitle}
            />

            <div className="flex items-start gap-3">
                {/* Avatar Column with Connection Line */}
                <AvatarColumn user={user} />

                {/* Message Content Column */}
                <MessageContentColumn
                    displayName={displayName}
                    time={time}
                    message={message}
                />
            </div>

            {/* Thread View Button with Connection Lines */}
            <ThreadViewButton
                participants={participants}
                messageCount={messageCount}
            />
        </div>
    )
}

// Separate component for thread header
const ThreadHeader: React.FC<{ displayName: string, threadTitle: string }> = ({ displayName, threadTitle }) => {
    return (
        <div className="flex items-center gap-1 mb-3 text-xs">
            <div className="flex items-center gap-0.5">
                <Hash className="h-3 w-3" />
                <span className="font-semibold">Thread</span>
            </div>
            <span className="text-muted-foreground">—</span>
            <span className="font-semibold">{displayName}</span>
            <span className="text-muted-foreground">started a thread:</span>
            <span className="font-semibold">{threadTitle}</span>
        </div>
    )
}

// Separate component for avatar and vertical line
const AvatarColumn: React.FC<{ user: UserFields }> = ({ user }) => {
    return (
        <div className="relative flex flex-col items-center">
            <UserAvatar user={user} size="md" />
            <div className="w-px bg-border flex-1 min-h-12" />
        </div>
    )
}

// Separate component for message content
const MessageContentColumn: React.FC<{
    displayName: string
    time: string
    message: string
}> = ({ displayName, time, message }) => {
    return (
        <div>
            <MessageHeader displayName={displayName} time={time} />
            <MessageBody message={message} />
        </div>
    )
}

// Message header with user name and timestamp
const MessageHeader: React.FC<{ displayName: string, time: string }> = ({ displayName, time }) => {
    return (
        <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{displayName}</span>
            <span className="text-xs text-muted-foreground/80">{time}</span>
        </div>
    )
}

// Message body content
const MessageBody: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="text-sm">
            <div>{message}</div>
        </div>
    )
}

// Thread view button with connection lines
const ThreadViewButton: React.FC<{
    participants: UserFields[]
    messageCount: number
}> = ({ participants, messageCount }) => {
    const participantAvatars = participants.map(p => ({
        id: p.name,
        name: p.full_name || p.name,
        image: p.user_image
    }))

    return (
        <div className="flex items-center ml-12">
            <ConnectionLine />
            <ThreadButton
                participants={participantAvatars}
                messageCount={messageCount}
            />
        </div>
    )
}

// Connection line element
const ConnectionLine: React.FC = () => {
    return (
        <div className="w-6 h-6 border-l border-b border-border rounded-bl-lg -ml-8" />
    )
}

// Thread button with participants and message count
const ThreadButton: React.FC<{
    participants: Array<{ id: string, name: string, image?: string }>
    messageCount: number
}> = ({ participants, messageCount }) => {
    return (
        <div className="inline-flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 hover:bg-accent/50 shadow-xs cursor-pointer">
            <GroupedAvatars
                users={participants}
                max={3}
                size="xs"
            />
            <span className="text-xs font-medium text-primary">
                {messageCount} Messages
            </span>
            <span className="text-xs text-muted-foreground">
                View thread
            </span>
        </div>
    )
}