import { memo } from "react"
import { MessageSquareMore } from "lucide-react"
import { Message } from "@raven/types/common/Message"
import { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { UserData } from "@db"
import { WorkspaceFields } from "@hooks/useWorkspaces"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { MessageContent } from "@components/features/message/renderers/MessageContent"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { formatDate } from "@lib/date"
import { cn } from "@lib/utils"

interface MessageResultBlockProps {
    message: Message
    /** Author of the message — resolved at parent (e.g. via a users Map). */
    user?: UserData
    /** Channel context — non-null for channel messages. */
    channel?: ChannelListItem
    /** DM channel context — non-null for DM messages. */
    dmChannel?: DMChannelListItem
    /** Peer user when message lives in a DM. */
    peer?: UserData
    /** Workspace the channel belongs to. */
    workspace?: WorkspaceFields
    onClick?: () => void
    className?: string
}

const MessageResultBlockInner = ({ message, user, channel, dmChannel, peer, workspace, onClick, className }: MessageResultBlockProps) => {

    const handleClick = onClick
    const handleKeyDown = onClick
        ? (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
            }
        }
        : undefined

    const dateLabel = formatDate(message.creation, "D MMMM YYYY, h:mm A")
    const peerName = peer?.full_name ?? dmChannel?.peer_user_id ?? ""

    return (
        <div
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
                "group relative flex gap-3 p-3 pb-4 transition-colors rounded",
                onClick && "cursor-pointer hover:bg-surface-gray-1 active:bg-surface-gray-2 focus-visible:bg-surface-gray-1 focus-visible:outline-none",
                className
            )}
        >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-outline-gray-2 mx-1" />
            {user && <UserAvatar user={user} size="md" showStatusIndicator={false} />}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 text-base md:text-sm">
                    {user && (
                        <span className="font-medium text-ink-gray-8 truncate">{user.full_name}</span>
                    )}
                    {workspace && (
                        <>
                            <span className="text-ink-gray-4 shrink-0">·</span>
                            <span className="text-ink-gray-4 truncate min-w-0">{workspace.workspace_name}</span>
                        </>
                    )}
                    {channel && (
                        <>
                            <span className="text-ink-gray-4 shrink-0">·</span>
                            <ChannelIcon type={channel.type} className="h-3 w-3 shrink-0 self-center text-ink-gray-4" />
                            <span className="text-ink-gray-4 truncate min-w-0 -ml-0.5">{channel.channel_name}</span>
                        </>
                    )}
                    {dmChannel && (
                        <>
                            <span className="text-ink-gray-4 shrink-0">·</span>
                            <MessageSquareMore className="h-3 w-3 shrink-0 self-center text-ink-gray-4" />
                            <span className="text-ink-gray-4 truncate min-w-0 -ml-0.5">{peerName}</span>
                        </>
                    )}
                    <span className="ml-auto shrink-0 text-xs text-ink-gray-4">{dateLabel}</span>
                </div>
                <div className="mt-0.5">
                    <MessageContent message={message} />
                </div>
            </div>
        </div>
    )
}

export const MessageResultBlock = memo(MessageResultBlockInner)
