import { AppSidebar } from "@components/app-sidebar"
import { AppLayout } from "@components/layout/AppLayout"
import AppHeader from "@components/features/header/AppHeader"
import { Outlet, useParams, useLocation } from "react-router-dom"
import React, { useMemo } from "react"
import { useLoadUsers } from "@hooks/useLoadUsers"
import { ActiveWorkspaceProvider, useActiveWorkspace } from "../../contexts/ActiveWorkspaceContext"
import { MainPageSkeleton } from "@components/features/main-page/MainPageSkeleton"
import { SIDEBAR_LESS_ROUTES } from "@utils/routes"
import { useIsMobile } from "@hooks/use-mobile"
import { MobileWorkspacePage } from "./MobileWorkspacePage"
import { SidebarProvider } from "@components/ui/sidebar"

const MainPageContent = () => {
    const params = useParams()
    const location = useLocation()
    const pathname = location.pathname
    const { activeWorkspaceName } = useActiveWorkspace()
    const isMobile = useIsMobile()

    const urlWorkspace = useMemo(() => {
        if (params.workspaceID) {
            return decodeURIComponent(params.workspaceID)
        }
        return null
    }, [params.workspaceID])

    const isReady = useLoadUsers()
    if (!isReady) return <MainPageSkeleton />

    const currentWorkspace = urlWorkspace || activeWorkspaceName

    // Mobile: route-based full-screen navigation (sidebar page ↔ channel page)
    if (isMobile) {
        if (!params.id) {
            return <MobileWorkspacePage workspaceName={currentWorkspace ?? ""} />
        }
        // Channel view: full-screen, no sidebar, ChannelHeader at top (app-header-height=0)
        return (
            <SidebarProvider>
                <div
                    className="flex flex-col h-screen min-h-0 overflow-hidden bg-surface-white"
                    style={{ "--app-header-height": "0px" } as React.CSSProperties}
                >
                    <Outlet />
                </div>
            </SidebarProvider>
        )
    }

    // Desktop layout
    const isDMWorkspace = currentWorkspace === "Direct Messages"
    const isDirectMessagesPage = pathname.startsWith("/dm-channel")
    const isSettingsPage = pathname.startsWith("/settings")
    const isSidebarLessPage = SIDEBAR_LESS_ROUTES.has(pathname) || isSettingsPage
    const shouldShowAppHeader = !isSidebarLessPage && !isDirectMessagesPage
    const sidebarWidth = (isDMWorkspace || isDirectMessagesPage) ? "380px" : "340px"

    return (
        <AppLayout
            sidebar={isSidebarLessPage ? null : <AppSidebar />}
            header={shouldShowAppHeader ? <AppHeader /> : null}
            sidebarWidth={sidebarWidth}
        >
            <Outlet />
        </AppLayout>
    )
}

const MainPage = () => {
    return (
        <ActiveWorkspaceProvider>
            <MainPageContent />
        </ActiveWorkspaceProvider>
    )
}

export default MainPage