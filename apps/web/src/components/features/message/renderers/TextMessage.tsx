import { UserFields } from "@raven/types/common/UserFields"
import { UserAvatar } from "../UserAvatar"

export default function TextMessage({ user, message, time }: { user: UserFields, message: string, time: string }) {
    return (
        <div className="flex items-start gap-3">
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{user?.full_name || user?.name || "User"}</span>
                    <span className="text-xs font-light text-muted-foreground/90">{time}</span>
                </div>
                <div className="text-[13px] text-primary">{message}</div>
            </div>
        </div>
    )
}
