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
import { useNavigate, useLocation } from "react-router-dom"
import { ChannelSidebar } from "./channel-sidebar/ChannelSidebar"
import { DMSidebar } from "./dm-sidebar/DMSidebar"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { useActiveWorkspace } from "../contexts/ActiveWorkspaceContext"
import { WorkspaceSwitcher } from "./workspace-switcher/WorkspaceSwitcher"
import _ from "@lib/translate"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [activeChannel, setActiveChannel] = React.useState<{ id: string; name: string; type: string; unread: number } | null>(null)
    const [activeDM, setActiveDM] = React.useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { activeWorkspaceName } = useActiveWorkspace()

    // Get channel data based on active workspace
    // TODO: Replace with real API call to fetch channels for workspace

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

                <div className="flex-1 flex flex-col overflow-hidden">
                    {location.pathname === "/threads" || location.pathname === "/mentions" ? null : location.pathname === "/direct-messages" ? (
                        <DMSidebar
                            workspaceName="Direct Messages"
                            activeDM={activeDM}
                            onDMClick={(email) => setActiveDM(email)}
                        />
                    ) : activeWorkspaceName === "Direct Messages" ? (
                        <DMSidebar
                            workspaceName={activeWorkspaceName}
                            activeDM={activeDM}
                            onDMClick={(email) => setActiveDM(email)}
                        />
                    ) : (
                        <>
                            <SidebarHeader className="h-[36px] gap-2 px-3 border-b flex items-center">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-sm font-medium text-foreground truncate">
                                        {activeWorkspaceName}
                                    </div>
                                    <Label className="flex items-center gap-2 text-[12px]">
                                        <span>{_("Unreads")}</span>
                                        <Switch className="shadow-none" />
                                    </Label>
                                </div>
                            </SidebarHeader>
                            <SidebarContent>
                                <SidebarGroup className="p-0">
                                    <SidebarGroupContent>
                                        <ChannelSidebar
                                            activeChannelId={activeChannel?.name}
                                            onChannelClick={handleChannelClick}
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