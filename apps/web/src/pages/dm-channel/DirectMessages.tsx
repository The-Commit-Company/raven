import { useNavigate, useParams, Outlet, Navigate } from "react-router-dom"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import AppHeader from "@components/features/header/AppHeader"
import { AppLayout } from "@components/layout/AppLayout"
import { SidebarShell } from "@components/layout/SidebarShell"
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarProvider,
} from "@components/ui/sidebar"
import { useChannels } from "@hooks/useChannels"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@components/ui/empty"
import { MobileDMPage } from "./MobileDMPage"


export function DirectMessagesEmptyState() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>{_("Select a conversation")}</EmptyTitle>
                <EmptyDescription>
                    {_("Choose a direct message from the sidebar to start chatting.")}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    )
}

export function DirectMessagesIndex() {
    const { dm_channels, isLoading } = useChannels()
    const isMobile = useIsMobile()

    if (isMobile) return null

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
    const isMobile = useIsMobile()
    const activeDMChannelId = id ?? null
    const { dm_channels, isLoading } = useChannels()

    // Mobile: route-based full-screen navigation (DM list page ↔ DM chat page)
    if (isMobile) {
        if (!id) {
            return <MobileDMPage />
        }
        // DM chat view: full-screen, no sidebar, DMChannelHeader at top (app-header-height=0)
        return (
            <SidebarProvider>
                <div className="flex flex-col h-screen min-h-0 overflow-hidden bg-surface-white flex-1 [--app-header-height:0px]">
                    <Outlet />
                </div>
            </SidebarProvider>
        )
    }

    const handleDMClick = (channelId: string) => {
        navigate(`/dm-channel/${encodeURIComponent(channelId)}`)
    }

    const dmSidebar = (
        <SidebarShell className="overflow-hidden h-full" data-state="expanded">
            <div className="flex-1 flex flex-col overflow-hidden">
                <SidebarHeader className="h-(--app-header-height) gap-2 px-3 border-b flex items-center group/header">
                    <div className="flex items-center justify-between w-full h-full">
                        <div className="text-sm font-medium text-ink-gray-8 truncate">
                            {_("Direct Messages")}
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="overflow-hidden">
                    <SidebarGroup className="p-0 flex-1 min-h-0">
                        <SidebarGroupContent className="flex-1 min-h-0 flex flex-col">
                            <DMSidebar
                                activeDMChannelId={activeDMChannelId}
                                onDMClick={handleDMClick}
                                dmChannels={dm_channels}
                                isLoadingChannels={isLoading}
                            />
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </div>
        </SidebarShell>
    )

    return (
        <AppLayout
            sidebar={dmSidebar}
            header={<AppHeader />}
            sidebarWidth="340px"
        >
            <Outlet />
        </AppLayout>
    )
}
