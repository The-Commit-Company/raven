import { ChevronRight, Info } from "lucide-react"
import { ChannelSidebarData } from "../../types/ChannelGroup"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { cn } from "@lib/utils"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSubItem,
} from "@components/ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@components/ui/tooltip"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { CustomizeSidebarButton } from "@components/features/channel/CustomizeSidebar/CustomizeSidebarButton"
import { CreateChannelButton } from "@components/features/channel/CreateChannel/CreateChannelButton"

interface ChannelSidebarProps {
    data: ChannelSidebarData
    activeChannelId?: string
    onChannelClick: (channel: ChannelListItem) => void
    onDataChange?: (data: ChannelSidebarData) => void
    showActions?: boolean
    showUnreadBadges?: boolean
}

export function ChannelSidebar({
    data,
    activeChannelId,
    onChannelClick,
    onDataChange,
    showActions = true,
    showUnreadBadges = true
}: ChannelSidebarProps) {

    // Calculate total unread count for a group
    const getGroupUnreadCount = (channels: ChannelListItem[]) => {
        return channels.reduce((total, channel) => {
            return total + (channel.last_message_details?.unread_count || 0)
        }, 0)
    }

    return (
        <SidebarGroup className="pt-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <SidebarGroupLabel className="text-muted-foreground/80 font-normal text-[11px]">Channels</SidebarGroupLabel>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-sidebar-foreground/50 hover:text-sidebar-foreground/70 cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <strong>Channel Groups:</strong> Organize channels into collapsible groups
                                    </div>
                                    <div>
                                        <strong>Ungrouped:</strong> Channels not in groups appear at the bottom
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-1">
                    <CustomizeSidebarButton data={data} onSave={onDataChange} />
                    <CreateChannelButton />
                </div>
            </div>
            <SidebarMenu>
                {/* Channel Groups */}
                {data.groups.map((group) => {
                    const totalUnread = getGroupUnreadCount(group.channels)
                    return (
                        <Collapsible
                            key={group.id}
                            asChild
                            defaultOpen={!group.isCollapsed}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={group.name.replace(/^[\p{Emoji}\u200d]+\s?/u, '')}
                                    >
                                        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        <span className="truncate text-[13px] flex items-center gap-1.5">
                                            {(() => {
                                                // Match emoji including compound emojis (with ZWJ)
                                                const emojiMatch = group.name.match(/^[\p{Emoji}\u200d]+/u);
                                                const emoji = emojiMatch ? emojiMatch[0] : null;
                                                const nameWithoutEmoji = group.name.replace(/^[\p{Emoji}\u200d]+\s?/u, '');
                                                return (
                                                    <>
                                                        {emoji && <span className="text-lg leading-none">{emoji}</span>}
                                                        <span>{nameWithoutEmoji}</span>
                                                    </>
                                                );
                                            })()}
                                        </span>
                                        <div className="ml-auto flex items-center gap-2">
                                            {showUnreadBadges && totalUnread > 0 && (
                                                <div className="badge-unread opacity-0 group-data-[state=closed]/collapsible:opacity-100 transition-opacity">
                                                    {totalUnread > 9 ? '9+' : totalUnread}
                                                </div>
                                            )}
                                        </div>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <ul className="border-sidebar-border ml-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2 py-0.5">
                                        {group.channels.map((channel) => (
                                            <SidebarMenuSubItem key={channel.name}>
                                                <button
                                                    onClick={() => onChannelClick(channel)}
                                                    className={cn(
                                                        "text-sidebar-foreground ml-2 ring-sidebar-ring hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 w-full",
                                                        activeChannelId === channel.name && "bg-sidebar-accent text-sidebar-accent-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <ChannelIcon
                                                            type={channel.type || "Public"}
                                                            className="w-4 h-4 shrink-0"
                                                        />
                                                        <span className={`truncate text-[13px] ${channel.last_message_details?.unread_count > 0 ? 'font-medium' : 'font-normal'}`}>
                                                            {channel.channel_name}
                                                        </span>
                                                    </div>
                                                    {showUnreadBadges && channel.last_message_details?.unread_count > 0 && (
                                                        <div className="badge-unread">
                                                            {channel.last_message_details.unread_count > 9 ? '9+' : channel.last_message_details.unread_count}
                                                        </div>
                                                    )}
                                                </button>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </ul>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    )
                })}

                {/* Ungrouped Channels */}
                {data.ungroupedChannels.map((channel) => (
                    <SidebarMenuItem key={channel.name}>
                        <SidebarMenuButton
                            asChild
                            isActive={activeChannelId === channel.name}>
                            <button
                                onClick={() => onChannelClick(channel)}
                                className="w-full hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground">
                                <div className="flex items-center gap-2 w-full">
                                    <ChannelIcon
                                        type={channel.type || "Public"}
                                        className="w-4 h-4 shrink-0"
                                    />
                                    <span className={`truncate text-[13px] ${channel.last_message_details?.unread_count > 0 ? 'font-medium' : 'font-normal'}`}>
                                        {channel.channel_name}
                                    </span>
                                </div>
                                {showUnreadBadges && channel.last_message_details?.unread_count > 0 && (
                                    <div className="badge-unread">
                                        {channel.last_message_details.unread_count > 9 ? '9+' : channel.last_message_details.unread_count}
                                    </div>
                                )}
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}