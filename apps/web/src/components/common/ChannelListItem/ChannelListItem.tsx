import * as React from "react"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { cn } from "@lib/utils"

interface ChannelListItemProps {
    name: string
    type?: "Public" | "Open" | "Private"
    unread?: number
    onClick?: () => void
    className?: string
}

export const ChannelListItem = React.forwardRef<
    HTMLAnchorElement,
    ChannelListItemProps & React.ComponentProps<"a">
>(({ name, type = "Public", unread = 0, onClick, className, ...props }, ref) => {
    return (
        <a
            ref={ref}
            href="#"
            onClick={onClick}
            className={cn(
                "flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                className
            )}
            {...props}
        >
            <div className="flex w-full items-center gap-2">
                <ChannelIcon
                    type={type}
                    className="w-4 h-4"
                />
                <span className={cn("font-medium", unread > 0 && "font-semibold")}>{name}</span>
                {unread > 0 && (
                    <div className="ml-auto bg-foreground text-background rounded px-1 py-0.5 text-[9px] font-semibold min-w-[16px] text-center">
                        {unread > 9 ? '9+' : unread}
                    </div>
                )}
            </div>
        </a>
    )
})