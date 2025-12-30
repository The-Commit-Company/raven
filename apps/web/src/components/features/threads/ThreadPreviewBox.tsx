import { Badge } from "@components/ui/badge"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { cn } from "@lib/utils"
import { UserFields } from "@raven/types/common/UserFields"
import { GroupedAvatars } from "@components/ui/grouped-avatars"

interface ParticipantUser {
    id: string
    name: string
    image?: string
}

interface ThreadPreviewBoxProps {
    user: UserFields | null
    messageContent: string
    formattedDate: string
    replyCount: number
    unreadCount: number
    channelName?: string
    channelIcon?: React.ReactNode
    participants?: ParticipantUser[]
    aiUser?: UserFields | null
    isDirectMessage?: boolean
    onClick?: () => void
    isActive?: boolean
}

export const ThreadPreviewBox = ({
    user,
    messageContent,
    formattedDate,
    replyCount,
    unreadCount,
    channelName,
    channelIcon,
    participants = [],
    aiUser,
    isDirectMessage = false,
    onClick,
    isActive
}: ThreadPreviewBoxProps) => {

    return (
        <div
            onClick={onClick}
            className={cn(
                "group block px-6 py-4 hover:bg-accent/50 transition-colors relative cursor-pointer border-b border-border",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive && "bg-muted/30",
                unreadCount > 0 && !isActive && "bg-muted/10"
            )}
        >
            {/* Connecting line from avatar to participants - only show for non-DM threads */}
            {!isDirectMessage && (
                <div className="absolute top-[80px] left-[40px] w-7 h-[calc(100%-6.75rem)] border-l border-b border-border rounded-bl-lg z-0" />
            )}

            {/* Header: Channel name and date */}
            {channelName && (
                <div className="flex items-center gap-2 mb-3 relative z-10">
                    {channelIcon && (
                        <span>{channelIcon}</span>
                    )}
                    <span className="font-medium text-xs">{channelName}</span>
                    <span className="text-xs text-muted-foreground">{formattedDate}</span>
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
                <span className="text-xs font-semibold text-primary">
                    {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                </span>
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && (
                <div className="absolute top-4 right-6">
                    <Badge
                        variant="default"
                        className="font-semibold min-w-[20px] h-5 flex items-center justify-center text-[10px] px-1.5"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                </div>
            )}
        </div>
    )
}
