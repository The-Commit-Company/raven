import { Outlet, Navigate, useMatch } from "react-router-dom"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
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

    // This layout mounts above the `:id` route — useParams here only sees
    // params matched up to this depth, so `id` was always undefined and the
    // mobile sidebar never hid. Match the path instead (end: false keeps
    // matching while a thread extends the URL).
    const id = useMatch({ path: "/dm-channel/:id", end: false })?.params.id

    // Always show the sidebar on desktop
    // On mobile, only show if there's no DM ID
    const shouldShowSidebar = !isMobile || !id

    return <div className="flex flex-col h-full min-h-0 w-full">
        <div className="flex min-h-0 flex-1">
            {shouldShowSidebar && <div className="md:w-(--dm-sidebar-width) w-full shrink-0 min-h-0">
                <DMSidebar />
            </div>}
            <div className="flex min-w-0 min-h-0 flex-1 flex-col bg-surface-gray-1">
                <Outlet />
            </div>
        </div>
        {!id && <AppMobileFooter />}
    </div>
}
