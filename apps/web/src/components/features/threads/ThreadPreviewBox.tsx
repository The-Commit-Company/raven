import { Badge } from "@components/ui/badge"
import { cn } from "@lib/utils"
import { RESULT_ROW_ACTIVE_CLASS } from "@components/common/MessageResultBlock/MessageResultBlock"
import { UserData } from "@db"
import { BaseThreadMessage } from "@components/common/BaseThreadMessage"
import { ThreadChannelDetails } from "./ThreadsList"
import { ThreadMessage } from "src/types/ThreadMessage"
import { formatRelativeDate } from "@lib/date"

interface ThreadPreviewBoxProps {
    user: UserData | null
    thread: ThreadMessage
    unreadCount: number
    channelDetails: ThreadChannelDetails
    onClick?: () => void
    isActive?: boolean
}

export const ThreadPreviewBox = ({
    user,
    thread,
    unreadCount,
    channelDetails,
    onClick,
    isActive
}: ThreadPreviewBoxProps) => {

    return (
        <div className="px-2 py-0.5">
        <div
            onClick={onClick}
            className={cn(
                "group block rounded px-6 py-4 transition-colors relative cursor-pointer select-none",
                "hover:bg-surface-gray-3 focus:outline-none focus-visible:bg-surface-gray-3",
                isActive && RESULT_ROW_ACTIVE_CLASS,
                unreadCount > 0 && !isActive && "bg-surface-gray-1"
            )}
        >
            {/* Connecting line from avatar to participants - only show for non-DM threads */}
            {!channelDetails.isDirectMessage && (
                <div className="absolute top-20 left-10 w-7 h-[calc(100%-6.75rem)] border-l border-b border-outline-gray-2 rounded-bl-lg z-0" />
            )}

            {/* Header: Channel name and date */}
            {channelDetails.channelName && (
                <div className="flex items-center gap-2 mb-3 relative z-10">
                    {channelDetails.channelIcon && (
                        <span>{channelDetails.channelIcon}</span>
                    )}
                    <span className="font-medium text-xs">{channelDetails.channelName}</span>
                    <span className="text-xs text-ink-gray-4">{formatRelativeDate(thread.last_message_timestamp)}</span>
                </div>
            )}

            <BaseThreadMessage
                user={user}
                channelDetails={channelDetails}
                showConnectorLine={false}
                thread={thread}
            />

            {/* Unread badge */}
            {unreadCount > 0 && (
                <div className="absolute top-4 right-6">
                    <Badge
                        variant="solid"
                        className="min-w-5 h-5 flex items-center justify-center text-[10px]"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                </div>
            )}
        </div>
        </div>
    )
}
