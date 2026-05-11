import { MessageContent } from "@components/features/message/renderers/MessageItem"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { ThreadChannelDetails } from "@components/features/threads/ThreadsList"
import { GroupedAvatars } from "@components/ui/grouped-avatars"
import { UserData } from "@db"
import _ from "@lib/translate"
import { Message } from "@raven/types/common/Message"
import { ThreadMessage } from "src/types/ThreadMessage"

interface BaseThreadMessageProps {
    user: UserData | null
    thread: ThreadMessage
    channelDetails: ThreadChannelDetails
    showConnectorLine?: boolean
}

export const BaseThreadMessage = ({
    user,
    thread,
    channelDetails
}: BaseThreadMessageProps) => {
    return (
        <div className="relative">

            {/* Author and message */}
            <div className="flex items-start gap-3 relative z-10">
                <div className="shrink-0">
                    {user ? <UserAvatar user={user} size="md" /> : <div className="w-10 h-10 rounded-full bg-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">
                        {user?.full_name || user?.name || _("User")}
                    </div>
                    <MessageContent message={thread as unknown as Message} />
                </div>
            </div>

            {/* Participants and reply count */}
            <div className="flex items-center gap-2 mt-3 ml-12 relative z-10">
                {!channelDetails.isDirectMessage ? (
                    <GroupedAvatars users={channelDetails.participants} max={3} size="xs" />
                ) : null}
                {thread.reply_count && thread.reply_count > 0 ? (
                    <span className="text-xs font-semibold text-primary">
                        {_(`${thread.reply_count} ${thread.reply_count === 1 ? 'Reply' : 'Replies'}`)}
                    </span>
                ) : null}
            </div>
        </div>
    )
}

