import { ChevronRight, Star } from 'lucide-react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@components/ui/collapsible'
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSubItem,
} from '@components/ui/sidebar'
import { ChannelIcon } from '@components/common/ChannelIcon/ChannelIcon'
import { cn } from '@lib/utils'
import { ChannelSidebarData } from '@raven/lib/hooks/useGroupedChannels'
import { useEffect, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import _ from '@lib/translate'

interface SidebarPreviewProps {
    data: ChannelSidebarData
}

export const SidebarPreview = ({ data }: SidebarPreviewProps) => {

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
    const [scrollerRef, setScrollerRef] = useState<HTMLElement | null>(null)

    useEffect(() => {
        data.groupedChannels.forEach(([groupName, channels]) => {
            if (channels.length > 0 && openGroups[groupName] === false) {
                setOpenGroups(prev => ({ ...prev, [groupName]: true }))
            }
            else if (channels.length === 0 && openGroups[groupName] === true) {
                setOpenGroups(prev => ({ ...prev, [groupName]: false }))
            }
        })
    }, [data.groupedChannels])

    const isGroupOpen = (groupName: string, hasChannels: boolean) => {
        if (groupName in openGroups) {
            return openGroups[groupName]
        }
        return hasChannels
    }

    return (
        <div className="flex flex-col h-full bg-surface-menu-bar/50">
            <SidebarGroup className="flex flex-col flex-1 min-h-0 gap-3 pb-12">
                <div ref={setScrollerRef} className="flex-1 min-h-0 overflow-auto">
                    <SidebarMenu>
                        {data.groupedChannels.map(([groupName, channels]) => (
                            <Collapsible
                                open={isGroupOpen(groupName, channels.length > 0)}
                                onOpenChange={(open) => setOpenGroups(prev => ({ ...prev, [groupName]: open }))}
                                key={groupName}
                                asChild
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="text-sm">
                                            <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            <span className="text-sm flex items-center gap-1.5 min-w-0 overflow-hidden">
                                                {(() => {
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
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="border-outline-gray-1 mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5">
                                            {channels.map((channel) => (
                                                <SidebarMenuSubItem key={channel.name}>
                                                    <div
                                                        className={cn(
                                                            "text-ink-gray-7 flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm"
                                                        )}
                                                    >
                                                        <ChannelIcon
                                                            type={channel.type || "Public"}
                                                            className="w-4 h-4 shrink-0"
                                                        />
                                                        <span className="truncate">
                                                            {channel.channel_name}
                                                        </span>
                                                    </div>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </ul>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}

                        {scrollerRef && <Virtuoso
                            customScrollParent={scrollerRef}
                            data={data.ungroupedChannels}
                            itemContent={(index, channel) => (
                                <SidebarMenuItem key={channel.name}>
                                    <SidebarMenuButton asChild className="text-sm">
                                        <div className="w-full flex items-center gap-2">
                                            <ChannelIcon
                                                type={channel.type || "Public"}
                                                className="w-4 h-4 shrink-0"
                                            />
                                            <span className="truncate">{channel.channel_name}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )} />}
                    </SidebarMenu>
                </div>
            </SidebarGroup>
        </div >
    )
}
