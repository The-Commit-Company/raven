import { ChevronRight } from 'lucide-react'
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
import { ChannelSidebarData } from 'src/types/ChannelGroup'

interface SidebarPreviewProps {
    data: ChannelSidebarData
}

export const SidebarPreview = ({ data }: SidebarPreviewProps) => {
    return (
        <div className="min-h-full bg-sidebar/50 px-3 py-4 text-[13px]">
            <SidebarGroup className="gap-3 pb-12">
                <SidebarMenu>
                    {data.groups.map((group) => (
                        <Collapsible
                            key={group.id}
                            asChild
                            defaultOpen={!group.isCollapsed}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="text-[13px]" tooltip={group.name}>
                                        <span>{group.name}</span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </div>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <ul className="border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5">
                                        {group.channels.map((channel) => (
                                            <SidebarMenuSubItem key={channel.name}>
                                                <div
                                                    className={cn(
                                                        "text-sidebar-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-[13px]"
                                                    )}
                                                >
                                                    <ChannelIcon
                                                        type={channel.type || "Public"}
                                                        className="w-4 h-4 flex-shrink-0"
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

                    {data.ungroupedChannels.map((channel) => (
                        <SidebarMenuItem key={channel.name}>
                            <SidebarMenuButton asChild className="text-[13px]">
                                <div className="w-full flex items-center gap-2">
                                    <ChannelIcon
                                        type={channel.type || "Public"}
                                        className="w-4 h-4 flex-shrink-0"
                                    />
                                    <span className="truncate">{channel.channel_name}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        </div>
    )
}
