import { ChevronRight, Star } from "lucide-react"
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
    useSidebar,
} from "@components/ui/sidebar"
import { Badge } from "@components/ui/badge"
import { ChannelIcon } from "@components/common/ChannelIcon/ChannelIcon"
import { CreateChannelButton } from "@components/features/channel/CreateChannel/CreateChannelButton"
import { useGroupedChannels } from "@raven/lib/hooks/useGroupedChannels"
import { useLocalStorage } from 'usehooks-ts'
import { CustomizeSidebarButton } from "@components/features/channel/CustomizeSidebar/CustomizeSidebarButton"
import { useChannels } from "@hooks/useChannels"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useParams } from "react-router"
import { useState } from "react"
import { Virtuoso } from "react-virtuoso"
import _ from "@lib/translate"


interface ChannelSidebarProps {
    activeChannelId?: string
    onChannelClick?: (channel: ChannelListItem) => void
    showUnreadBadges?: boolean
}

interface GroupsState {
    [key: string]: boolean
}

// TODO: Fix the entire sidebar logic
export function ChannelSidebar({
    activeChannelId,
    onChannelClick,
    showUnreadBadges = true
}: ChannelSidebarProps) {

    const { channels } = useChannels()
    const { myProfile } = useCurrentRavenUser()
    const { workspaceID } = useParams()
    const [showMyChannelsOnly, setShowMyChannelsOnly] = useState(false)
    const channelSidebarData = useGroupedChannels(channels, myProfile, workspaceID, showMyChannelsOnly)
    const { setOpenMobile, isMobile } = useSidebar()

    const handleChannelClick = (channel: ChannelListItem) => {
        onChannelClick?.(channel)
        if (isMobile) setOpenMobile(false)
    }

    // Calculate total unread count for a group
    const getGroupUnreadCount = (channels: ChannelListItem[]) => {
        return channels.reduce((total, channel) => {
            return total + (channel.last_message_details?.unread_count || 0)
        }, 0)
    }

    const [groupsState, setGroupsState] = useLocalStorage<GroupsState>('channel-sidebar-groups-state', {})

    const handleGroupStateChange = (groupName: string, open: boolean) => {
        setGroupsState(prev => ({ ...prev, [groupName]: open }))
    }

    const [scrollerRef, setScrollerRef] = useState<HTMLElement | null>(null)

    if (!myProfile) {
        return null
    }

    return (
        <SidebarGroup className="pt-1 flex-1 min-h-0 border-r border-outline-gray-1 w-(--sidebar-width) max-w-(--sidebar-width) bg-surface-menu-bar">
            {/* <SidebarGroupLabel className="text-ink-gray-4/80 font-normal">{_("Unreads")}</SidebarGroupLabel> */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <SidebarGroupLabel className="text-ink-gray-4 font-normal">{_("Channels")}</SidebarGroupLabel>
                </div>
                <div className="flex items-center gap-1">
                    <CustomizeSidebarButton showMyChannelsOnly={showMyChannelsOnly} setShowMyChannelsOnly={setShowMyChannelsOnly} />
                    <CreateChannelButton />
                </div>
            </div>
            <div ref={setScrollerRef} className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
                <SidebarMenu>
                    {/* Channel Groups */}
                    {channelSidebarData.groupedChannels.map(([groupName, channels]) => {
                        const totalUnread = getGroupUnreadCount(channels)
                        return (
                            <Collapsible
                                key={groupName}
                                asChild
                                open={groupsState[groupName] ?? true}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger onClick={() => handleGroupStateChange(groupName, !(groupsState[groupName] ?? true))} asChild>
                                        <SidebarMenuButton>
                                            <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            <span className="text-base md:text-sm flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                {(() => {
                                                    // Match emoji including compound emojis (with ZWJ)
                                                    const emojiMatch = groupName.match(/^[\p{Emoji}\u200d]+/u);
                                                    const emoji = emojiMatch ? emojiMatch[0] : null;
                                                    const nameWithoutEmoji = groupName.replace(/^[\p{Emoji}\u200d]+\s?/u, '');
                                                    if (groupName === "Favorites") {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <Star className="h-4 w-4 text-ink-gray-8/80" />
                                                                <span className="truncate">{_("Favorites")}</span>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <>
                                                                {emoji && <span className="text-lg leading-none shrink-0">{emoji}</span>}
                                                                <span className="truncate">{nameWithoutEmoji}</span>
                                                            </>
                                                        );
                                                    }
                                                })()}
                                            </span>
                                            <div className="ml-auto shrink-0 flex items-center gap-2">
                                                {showUnreadBadges && totalUnread > 0 && (
                                                    <Badge size="sm" variant="solid" theme="gray" className="opacity-0 group-data-[state=closed]/collapsible:opacity-100 transition-opacity">
                                                        {totalUnread > 9 ? '9+' : totalUnread}
                                                    </Badge>
                                                )}
                                            </div>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="border-outline-gray-1 ml-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2 py-0.5">
                                            {channels.map((channel) => (
                                                <SidebarMenuSubItem key={channel.name}>
                                                    <button
                                                        onClick={() => handleChannelClick(channel)}
                                                        className={cn(
                                                            "text-ink-gray-7 ml-2 ring-outline-gray-3 hover:bg-surface-gray-3/80 hover:text-ink-gray-8 active:bg-surface-gray-3 active:text-ink-gray-8 flex h-8 sm:h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 w-full",
                                                            activeChannelId === channel.name && "bg-surface-gray-3 text-ink-gray-8"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            <ChannelIcon
                                                                type={channel.type || "Public"}
                                                                className="w-4 h-4 shrink-0"
                                                            />
                                                            <span className={`truncate text-base md:text-sm ${channel.last_message_details?.unread_count > 0 ? 'font-medium' : 'font-normal'}`}>
                                                                {channel.channel_name}
                                                            </span>
                                                        </div>
                                                        {showUnreadBadges && channel.last_message_details?.unread_count > 0 && (
                                                            <Badge size="sm" variant="solid" theme="gray">
                                                                {channel.last_message_details.unread_count > 9 ? '9+' : channel.last_message_details.unread_count}
                                                            </Badge>
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
                    {scrollerRef && (
                        <Virtuoso
                            customScrollParent={scrollerRef}
                            data={channelSidebarData.ungroupedChannels}
                            itemContent={(index, channel) => (
                                <SidebarMenuItem key={channel.name}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={activeChannelId === channel.name}>
                                        <button
                                            onClick={() => handleChannelClick(channel)}
                                            className="w-full hover:bg-surface-gray-3/80 hover:text-ink-gray-8">
                                            <div className="flex items-center gap-2 w-full">
                                                <ChannelIcon
                                                    type={channel.type || "Public"}
                                                    className="w-4 h-4 shrink-0"
                                                />
                                                <span className={`truncate text-base md:text-sm ${channel.last_message_details?.unread_count > 0 ? 'font-medium' : 'font-normal'}`}>
                                                    {channel.channel_name}
                                                </span>
                                            </div>
                                            {showUnreadBadges && channel.last_message_details?.unread_count > 0 && (
                                                <Badge size="sm" variant="solid" theme="gray">
                                                    {channel.last_message_details.unread_count > 9 ? '9+' : channel.last_message_details.unread_count}
                                                </Badge>
                                            )}
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        />
                    )}
                </SidebarMenu>
            </div>
        </SidebarGroup>
    )
}