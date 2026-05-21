import * as React from "react"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserData } from "@db"
import { cn } from "@lib/utils"
import { Badge } from "@components/ui/badge"

interface DMListItemProps {
    user: UserData
    date: string
    teaser: string
    unread?: number
    isActive?: boolean
    className?: string
}

export const DMListItem = React.forwardRef<HTMLAnchorElement,
    DMListItemProps & React.ComponentProps<"a">
>(({ user, date, teaser, unread = 0, isActive = false, onClick, className, ...props }, ref) => {
    return (
        <a
            ref={ref}
            href="#"
            onClick={onClick}
            className={cn(
                "flex items-start gap-3 border-b px-4 py-3.5 text-sm leading-tight last:border-b-0 hover:bg-surface-gray-3 hover:text-ink-gray-8 transition-colors relative",
                isActive && "bg-surface-gray-3/90 text-ink-gray-8",
                className
            )}
            {...props}
        >
            <div className="shrink-0 self-center">
                <UserAvatar
                    user={user}
                    size="md"
                    showStatusIndicator={false}
                    showBotIndicator={false}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    <span className="text-2xs font-light text-ink-gray-4/90 shrink-0">{date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "line-clamp-1 text-xs text-ink-gray-4/80 flex-1 min-w-0",
                        unread > 0 && "font-medium text-ink-gray-8/90"
                    )}>
                        {teaser}
                    </div>
                    {unread > 0 && (
                        <Badge size="sm" variant="solid" theme="gray">
                            {unread > 9 ? '9+' : unread}
                        </Badge>
                    )}
                </div>
            </div>
        </a>
    )
})