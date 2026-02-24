import { useNavigate, useParams, Outlet } from "react-router-dom"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import AppHeader from "@components/features/header/AppHeader"
import { AppLayout } from "@components/layout/AppLayout"
import { SidebarShell } from "@components/layout/SidebarShell"
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
    const { id } = useParams<{ id?: string }>()
    const activeDMChannelId = id ?? null
    const { dm_channels, isLoading } = useChannelList()

    const handleDMClick = (channelId: string) => {
        navigate(`/dm-channel/${encodeURIComponent(channelId)}`)
    }

    const dmSidebar = (
        <SidebarShell className="overflow-hidden h-full" data-state="expanded">
            <DMSidebar
                workspaceName="Direct Messages"
                activeDMChannelId={activeDMChannelId}
                onDMClick={handleDMClick}
                dmChannelsFromAPI={dm_channels}
                isLoadingChannels={isLoading}
            />
        </SidebarShell>
    )

    return (
        <AppLayout
            sidebar={dmSidebar}
            header={<AppHeader left="var(--sidebar-width, 380px)" width="calc(100% - var(--sidebar-width, 380px))" />}
            sidebarWidth="380px"
        >
            <Outlet />
        </AppLayout>
    )
}
