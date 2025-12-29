import { UserAvatar } from "../UserAvatar"
import type { UserFields } from "@raven/types/common/UserFields"

export default function ReplyMessage({
    user,
    message,
    time,
    repliedTo,
    name,
}: {
    user: UserFields
    message: string
    time: string
    repliedTo: { user: UserFields; message: string }
    name: string
}) {
    return (
        <div className="flex items-start gap-3" data-message-id={name}>
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                    <span className="text-xs font-light text-muted-foreground/90">{time}</span>
                </div>
                <div className="border-l-2 border-gray-500 bg-muted/60 pl-3 pt-1 pb-2 my-1">
                    <span className="text-xs text-muted-foreground font-medium">
                        Replying to {repliedTo.user?.full_name || repliedTo.user?.name || "User"}
                    </span>
                    <div className="text-xs text-muted-foreground truncate">
                        {repliedTo.message}
                    </div>
                </div>
                <div className="text-[13px] text-primary wrap-break-word">{message}</div>
            </div>
        </div>
    )
} 