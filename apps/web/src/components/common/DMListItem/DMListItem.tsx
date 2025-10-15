import * as React from "react"
import { UserAvatar } from "@components/features/message/UserAvatar"
import { UserFields } from "@raven/types/common/UserFields"
import { cn } from "@lib/utils"

interface DMListItemProps {
    user: UserFields
    date: string
    teaser: string
    unread?: number
    onClick?: () => void
    className?: string
}

export const DMListItem = React.forwardRef<HTMLAnchorElement,
    DMListItemProps & React.ComponentProps<"a">
>(({ user, date, teaser, unread = 0, onClick, className, ...props }, ref) => {
    return (
        <a
            ref={ref}
            href="#"
            onClick={onClick}
            className={cn(
                "flex items-start gap-3 border-b px-4 py-3.5 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors relative",
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
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    <span className="text-xs font-light text-muted-foreground/90 flex-shrink-0">{date}</span>
                </div>
                <div className={cn(
                    "line-clamp-1 text-xs text-muted-foreground/80",
                    unread > 0 && "font-medium text-foreground/90"
                )}>
                    {teaser}
                </div>
            </div>
            {unread > 0 && (
                <div className="absolute top-3.5 right-4 bg-foreground text-background rounded px-1 py-0.5 text-[9px] font-semibold min-w-[16px] text-center">
                    {unread > 9 ? '9+' : unread}
                </div>
            )}
        </a>
    )
})