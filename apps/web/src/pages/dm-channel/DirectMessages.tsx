import { useNavigate, useParams, Outlet, Navigate } from "react-router-dom"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import AppHeader from "@components/features/header/AppHeader"
import { AppLayout } from "@components/layout/AppLayout"
import { SidebarShell } from "@components/layout/SidebarShell"
import { useChannels } from "@hooks/useChannels"
import _ from "@lib/translate"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@components/ui/empty"


export function DirectMessagesEmptyState() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{_("Select a conversation")}</EmptyTitle>
                <EmptyDescription>{_("Choose a direct message from the sidebar to start chatting.")}</EmptyDescription>
            </EmptyHeader>
        </Empty>
    )
}

export function DirectMessagesIndex() {
    const { dm_channels, isLoading } = useChannels()

    if (isLoading) return null

    const firstDM = dm_channels[0]
    if (firstDM) {
        return <Navigate to={`/dm-channel/${encodeURIComponent(firstDM.name)}`} replace />
    }

    return <DirectMessagesEmptyState />
}

export default function DirectMessages() {
    const navigate = useNavigate()
    const { id } = useParams<{ id?: string }>()
    const activeDMChannelId = id ?? null
    const { dm_channels, isLoading } = useChannels()

    const handleDMClick = (channelId: string) => {
        navigate(`/dm-channel/${encodeURIComponent(channelId)}`)
    }

    const dmSidebar = (
        <SidebarShell className="overflow-hidden h-full" data-state="expanded">
            <DMSidebar
                workspaceName="Direct Messages"
                activeDMChannelId={activeDMChannelId}
                onDMClick={handleDMClick}
                dmChannels={dm_channels}
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
