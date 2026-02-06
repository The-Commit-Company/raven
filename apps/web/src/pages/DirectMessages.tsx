import { useNavigate, useParams, Outlet } from "react-router-dom"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { Sidebar, SidebarProvider, SidebarInset } from "@components/ui/sidebar"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import { DMTopBar } from "@components/features/dm-channel/DMTopBar"
import { useChannelList } from "@hooks/useChannelList"

export function DirectMessagesEmptyState() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs">Choose a direct message from the sidebar to start chatting.</p>
        </div>
    )
}

export default function DirectMessages() {
    const navigate = useNavigate()
    const { dm_channel_id } = useParams<{ dm_channel_id?: string }>()
    const { dm_channels, isLoading } = useChannelList()

    const handleDMClick = (channelId: string) => {
        navigate(`/direct-messages/${encodeURIComponent(channelId)}`)
    }

    return (
        <div className="flex flex-col h-screen min-h-0 overflow-hidden" style={{ "--workspace-switcher-width": "60px", "--sidebar-width": "380px" } as React.CSSProperties}>
            <SidebarProvider
                className="flex-1 min-h-0 min-w-0"
                style={{
                    "--sidebar-width": "380px",
                    "--sidebar-width-icon": "60px",
                    "--app-header-height": "36px",
                } as React.CSSProperties}
            >
                <Sidebar className="overflow-hidden h-full" data-state="expanded">
                    <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                        <WorkspaceSwitcher />
                        <div className="flex-1 flex flex-col">
                            <DMSidebar
                                workspaceName="Direct Messages"
                                activeDMChannelId={dm_channel_id ?? null}
                                onDMClick={handleDMClick}
                                dmChannelsFromAPI={dm_channels}
                                isLoadingChannels={isLoading}
                            />
                        </div>
                    </div>
                </Sidebar>
                <SidebarInset className="flex flex-1 flex-col min-h-0 overflow-hidden">
                    <DMTopBar />
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
