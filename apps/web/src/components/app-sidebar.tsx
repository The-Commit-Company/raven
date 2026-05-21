import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
} from "@components/ui/sidebar"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ChannelSidebar } from "./channel-sidebar/ChannelSidebar"
import { DMSidebar } from "./dm-sidebar/DMSidebar"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { useActiveWorkspace } from "../contexts/ActiveWorkspaceContext"
import { SidebarShell } from "@components/layout/SidebarShell"

export function AppSidebar(props: React.ComponentProps<typeof SidebarShell>) {
    const navigate = useNavigate()
    const location = useLocation()
    const { activeWorkspaceName } = useActiveWorkspace()
    const { id: activeChannelId } = useParams<{ id?: string }>()

    const handleChannelClick = (channel: ChannelListItem) => {
        if (activeWorkspaceName) {
            const channelId = channel.name
            localStorage.setItem('ravenLastChannel', JSON.stringify(channelId))
            navigate(`/${encodeURIComponent(activeWorkspaceName)}/${encodeURIComponent(channelId)}`)
        }
    }

    return (
        <SidebarShell collapsible="icon" className="overflow-hidden h-full" {...props}>
            <div className="flex-1 flex flex-col overflow-hidden">
                {location.pathname === "/threads" || location.pathname === "/notifications" ? null : location.pathname.startsWith("/dm-channel") || activeWorkspaceName === "Direct Messages" ? (
                    <DMSidebar
                        workspaceName="Direct Messages"
                        activeDMChannelId={null}
                        onDMClick={(dmChannelId) =>
                            navigate(`/dm-channel/${encodeURIComponent(dmChannelId)}`)
                        }
                    />
                ) : (
                    <>
                        <SidebarHeader className="h-(--app-header-height) gap-2 px-3 border-b flex items-center group/header">
                            <div className="flex items-center justify-between w-full h-full">
                                <div className="text-sm font-medium text-ink-gray-8 truncate">
                                    {activeWorkspaceName}
                                </div>
                            </div>
                        </SidebarHeader>

                        <SidebarContent className="overflow-hidden">
                            <SidebarGroup className="p-0 flex-1 min-h-0">
                                <SidebarGroupContent className="flex-1 min-h-0 flex flex-col">
                                    <ChannelSidebar
                                        activeChannelId={activeChannelId}
                                        onChannelClick={handleChannelClick}
                                    />
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </>
                )}
            </div>
        </SidebarShell>
    )
}