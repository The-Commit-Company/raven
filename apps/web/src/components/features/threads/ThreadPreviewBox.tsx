import { Badge } from "@components/ui/badge"
import { cn } from "@lib/utils"
import { UserData } from "@db"
import { BaseThreadMessage } from "@components/common/BaseThreadMessage"
import { ThreadChannelDetails } from "./ThreadsList"
import { ThreadMessage } from "src/types/ThreadMessage"
import { formatDate } from "@lib/date"

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
        <div
            onClick={onClick}
            className={cn(
                "group block px-6 py-4 hover:bg-surface-gray-3/50 transition-colors relative cursor-pointer border-b border-outline-gray-2",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-4 focus-visible:ring-inset",
                isActive && "bg-surface-gray-2/30",
                unreadCount > 0 && !isActive && "bg-surface-gray-2/10"
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
                    <span className="text-xs text-ink-gray-4">{formatDate(thread.last_message_timestamp, "D MMMM YYYY h:mm A")}</span>
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
    )
}
