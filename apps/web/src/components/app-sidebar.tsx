import * as React from "react"
import { Label } from "@components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
} from "@components/ui/sidebar"
import { Switch } from "@components/ui/switch"
import { useNavigate } from "react-router-dom"
import { ChannelSidebar } from "./channel-sidebar/ChannelSidebar"
import { DMSidebar } from "./dm-sidebar/DMSidebar"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { ChannelSidebarData } from "../types/ChannelGroup"
import { erpNextData } from "../data/channelSidebarData"
import { useActiveWorkspace } from "../contexts/ActiveWorkspaceContext"
import { WorkspaceSwitcher } from "./workspace-switcher/WorkspaceSwitcher"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [activeChannel, setActiveChannel] = React.useState<{ id: string; name: string; type: string; unread: number } | null>(null)
    const navigate = useNavigate()
    const { activeWorkspaceName } = useActiveWorkspace()

    // Get channel data based on active workspace
    // TODO: Replace with real API call to fetch channels for workspace
    const getChannelDataForWorkspace = (workspaceName: string | undefined): ChannelSidebarData => {
        // For now, use default data. In production, fetch channels from API based on workspaceName
        return erpNextData
    }

    const [channelSidebarData, setChannelSidebarData] = React.useState<ChannelSidebarData>(() =>
        getChannelDataForWorkspace(activeWorkspaceName ?? undefined)
    )

    // Update channel data when workspace changes
    React.useEffect(() => {
        setChannelSidebarData(getChannelDataForWorkspace(activeWorkspaceName ?? undefined))
    }, [activeWorkspaceName])

    const handleChannelClick = (channel: ChannelListItem) => {
        setActiveChannel({
            id: channel.name,
            name: channel.channel_name,
            type: channel.type || "Public",
            unread: channel.last_message_details?.unread_count || 0
        })
        if (activeWorkspaceName) {
            const workspaceSlug = encodeURIComponent(activeWorkspaceName)
            const channelId = channel.name || channel.channel_name || "general"
            // Save to localStorage
            localStorage.setItem('ravenLastChannel', JSON.stringify(channelId))
            navigate(`/${workspaceSlug}/channel/${encodeURIComponent(channelId)}`)
        }
    }

    return (
        <Sidebar collapsible="icon" className="overflow-hidden h-full" {...props}>
            <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                <WorkspaceSwitcher />

                <div className="flex-1 flex flex-col">
                    {location.pathname === "/threads" || location.pathname === "/notifications" ? null : location.pathname.startsWith("/direct-messages") || activeWorkspaceName === "Direct Messages" ? (
                        <DMSidebar
                            workspaceName="Direct Messages"
                            activeDMChannelId={null}
                            onDMClick={(dmChannelId) => navigate(`/direct-messages/${encodeURIComponent(dmChannelId)}`)}
                        />
                    ) : (
                        <>
                            <SidebarHeader className="h-[36px] gap-2 px-3 border-b flex items-center">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-sm font-medium text-foreground truncate">
                                        {activeWorkspaceName}
                                    </div>
                                    <Label className="flex items-center gap-2 text-[12px]">
                                        <span>Unreads</span>
                                        <Switch className="shadow-none" />
                                    </Label>
                                </div>
                            </SidebarHeader>
                            <SidebarContent>
                                <SidebarGroup className="p-0">
                                    <SidebarGroupContent>
                                        <ChannelSidebar
                                            data={channelSidebarData}
                                            activeChannelId={activeChannel?.name}
                                            onChannelClick={handleChannelClick}
                                            onDataChange={setChannelSidebarData}
                                        />
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </>
                    )}
                </div>
            </div>
        </Sidebar>
    )
}