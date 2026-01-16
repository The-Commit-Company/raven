import { AppSidebar } from "@components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@components/ui/sidebar"
import AppHeader from "@components/features/header/AppHeader"
import { Outlet, useLocation } from "react-router-dom"
import React, { useState } from "react"
import { useLoadUsers } from "@hooks/useLoadUsers"
import { ActiveWorkspaceProvider, useActiveWorkspace } from "../contexts/ActiveWorkspaceContext"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"


const MainPageContent = () => {
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"
    const [searchValue, setSearchValue] = useState("")
    const { activeWorkspaceName } = useActiveWorkspace()

    const isReady = useLoadUsers()
    // TODO: Add a loading state
    if (!isReady) return <div>Loading users...</div>

    const isDMWorkspace = activeWorkspaceName === "Direct Messages"
    const isDirectMessagesPage = location.pathname === "/direct-messages"
    const isThreadsPage = location.pathname === "/threads"
    const isMentionsPage = location.pathname === "/mentions"
    const isSavedMessagesPage = location.pathname === "/saved-messages"
    const isSettingsPage = location.pathname.startsWith("/settings")
    const isSidebarLessPage = isThreadsPage || isMentionsPage || isSavedMessagesPage || isSettingsPage
    // Sidebar width is the total width including workspace switcher (60px) + content area
    // Regular: 60px (workspace switcher) + 280px (content) = 340px
    // DMs: 60px (workspace switcher) + 360px (content) = 420px
    const sidebarWidth = (isDMWorkspace || isDirectMessagesPage) ? "420px" : "340px"

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
                {!isSidebarLessPage && <AppHeader searchValue={isSearchPage ? searchValue : undefined} onSearchChange={isSearchPage ? setSearchValue : undefined} />}
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