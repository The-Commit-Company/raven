import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { GroupedAvatars } from "@components/ui/grouped-avatars"

interface ParticipantUser {
    id: string
    name: string
    image?: string
}

interface BaseThreadMessageProps {
    user: UserFields | null
    messageContent: string
    channelName?: string
    channelIcon?: React.ReactNode
    participants?: ParticipantUser[]
    aiUser?: UserFields | null
    isDirectMessage?: boolean
    replyCount?: number
    showConnectorLine?: boolean
}

export const BaseThreadMessage = ({
    user,
    messageContent,
    channelName,
    channelIcon,
    participants = [],
    aiUser,
    isDirectMessage = false,
    replyCount = 0,
}: BaseThreadMessageProps) => {
    return (
        <div className="relative">
            {/* Header: Channel name */}
            {channelName && (
                <div className="flex items-center gap-2 mb-3 relative z-10">
                    {channelIcon && (
                        <span>{channelIcon}</span>
                    )}
                    <span className="font-medium text-xs">{channelName}</span>
                </div>
            )}

            {/* Author and message */}
            {user ? (
                <div className="flex items-start gap-3 relative z-10">
                    <div className="shrink-0">
                        <UserAvatar user={user} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">
                            {user.full_name || user.name || "User"}
                        </div>
                        <div className="text-[13px] text-foreground leading-relaxed">
                            {messageContent || 'No content'}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3 relative z-10">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-muted" />
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">User</div>
                        <div className="text-[13px] text-foreground leading-relaxed">
                            {messageContent || 'No content'}
                        </div>
                    </div>
                </div>
            )}

            {/* Participants and reply count */}
            <div className="flex items-center gap-2 mt-3 ml-12 relative z-10">
                {!isDirectMessage && (
                    <>
                        {aiUser ? (
                            <UserAvatar user={aiUser} size="xs" showStatusIndicator={false} />
                        ) : participants.length > 0 ? (
                            <GroupedAvatars users={participants} max={3} size="xs" />
                        ) : null}
                    </>
                )}
                {replyCount > 0 && (
                    <span className="text-xs font-semibold text-primary">
                        {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                    </span>
                )}
            </div>
        </div>
    )
}

