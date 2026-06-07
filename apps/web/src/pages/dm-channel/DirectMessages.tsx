import { useParams, Outlet, Navigate } from "react-router-dom"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import AppHeader from "@components/features/header/AppHeader"
import { useChannels } from "@hooks/useChannels"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@components/ui/empty"
import AppMobileFooter from "@components/features/header/AppMobileFooter"


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
    const isMobile = useIsMobile()

    const { id } = useParams<{ id?: string }>()


    // Always show the sidebar on desktop
    // On mobile, only show if there's no DM ID
    const shouldShowSidebar = !isMobile || !id

    return <div className="flex flex-col h-full overflow-hidden w-full">
        {shouldShowSidebar && <AppHeader title={_("Direct Messages")} />}
        <div className="flex sm:flex-row flex-col">
            {shouldShowSidebar && <div className="md:w-(--dm-sidebar-width) w-screen h-screen border-r border-outline-gray-1">
                <DMSidebar />
            </div>}
            <Outlet />
        </div>
        {!id && <AppMobileFooter />}
    </div>
}
