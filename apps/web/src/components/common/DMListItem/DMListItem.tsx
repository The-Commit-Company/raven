import * as React from "react"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { cn } from "@lib/utils"

interface DMListItemProps {
    user: UserFields
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
                "flex items-start gap-3 border-b px-4 py-3.5 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors relative",
                isActive && "bg-sidebar-accent/90 text-sidebar-accent-foreground",
                className
            )}
            {...props}
        >
            <div className="flex-shrink-0 self-center">
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
                    <span className="text-[11px] font-light text-muted-foreground/90 flex-shrink-0">{date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "line-clamp-1 text-xs text-muted-foreground/80 flex-1 min-w-0",
                        unread > 0 && "font-medium text-foreground/90"
                    )}>
                        {teaser}
                    </div>
                    {unread > 0 && (
                        <div className="badge-unread">
                            {unread > 9 ? '9+' : unread}
                        </div>
                    )}
                </div>
            </div>
        </a>
    )
})