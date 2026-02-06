import { AppSidebar } from "@components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@components/ui/sidebar"
import AppHeader from "@components/features/header/AppHeader"
import { Outlet, useParams, useLocation } from "react-router-dom"
import React, { useState, useMemo } from "react"
import { useLoadUsers } from "@hooks/useLoadUsers"
import { ActiveWorkspaceProvider, useActiveWorkspace } from "../contexts/ActiveWorkspaceContext"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { MainPageSkeleton } from "@components/features/main-page/MainPageSkeleton"
import { SIDEBAR_LESS_ROUTES } from "@utils/routes"


const MainPageContent = () => {
    const params = useParams()
    const location = useLocation()
    const pathname = location.pathname
    const [searchValue, setSearchValue] = useState("")
    const { activeWorkspaceName } = useActiveWorkspace()
    
    // Derive workspace from URL params (single source of truth)
    // Note: WorkspaceSwitcher and AppSidebar handle syncing URL workspace to context
    const urlWorkspace = useMemo(() => {
        if (params.workspaceID) {
            return decodeURIComponent(params.workspaceID)
        }
        return null
    }, [params.workspaceID])

    const isReady = useLoadUsers()
    if (!isReady) return <MainPageSkeleton />

    // Use URL workspace as source of truth, fallback to context for non-workspace routes
    const currentWorkspace = urlWorkspace || activeWorkspaceName
    const isDMWorkspace = currentWorkspace === "Direct Messages"
    const isSearchPage = pathname === "/search"
    const isDirectMessagesPage = pathname === "/direct-messages"
    const isSettingsPage = pathname.startsWith("/settings")
    const isSidebarLessPage = SIDEBAR_LESS_ROUTES.has(pathname) || isSettingsPage
    // Direct messages page should not show AppHeader (it has its own header)
    const shouldShowAppHeader = !isSidebarLessPage && !isDirectMessagesPage
    // Sidebar width is the total width including workspace switcher (60px) + content area
    // Regular: 60px (workspace switcher) + 280px (content) = 340px
    // DMs: 60px (workspace switcher) + 320px (content) = 380px
    const sidebarWidth = (isDMWorkspace || isDirectMessagesPage) ? "380px" : "340px"

    return (
        <div className="flex flex-col h-screen" style={{ "--workspace-switcher-width": "60px" } as React.CSSProperties}>
            {isSidebarLessPage && (
                <WorkspaceSwitcher standalone />
            )}
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": sidebarWidth,
                        "--sidebar-width-icon": "60px",
                        "--app-header-height": "36px",
                        "--workspace-switcher-width": "60px",
                    } as React.CSSProperties
                }>
                {shouldShowAppHeader && <AppHeader searchValue={isSearchPage ? searchValue : undefined} onSearchChange={isSearchPage ? setSearchValue : undefined} />}
                {!isSidebarLessPage && <AppSidebar />}
                <SidebarInset
                    className="overflow-hidden"
                    style={isSidebarLessPage ? {
                        marginLeft: "var(--workspace-switcher-width, 60px)"
                    } as React.CSSProperties : undefined}
                >
                    <Outlet context={{ searchValue, setSearchValue }} />
                </SidebarInset>
            </SidebarProvider>
        </div>
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