import { AppSidebar } from "@components/app-sidebar"
import { AppLayout } from "@components/layout/AppLayout"
import AppHeader from "@components/features/header/AppHeader"
import { Outlet, useParams, useLocation } from "react-router-dom"
import React, { useState, useMemo } from "react"
import { useLoadUsers } from "@hooks/useLoadUsers"
import { ActiveWorkspaceProvider, useActiveWorkspace } from "../../contexts/ActiveWorkspaceContext"
import { MainPageSkeleton } from "@components/features/main-page/MainPageSkeleton"
import { SIDEBAR_LESS_ROUTES } from "@utils/routes"

const MainPageContent = () => {
    const params = useParams()
    const location = useLocation()
    const pathname = location.pathname
    const { activeWorkspaceName } = useActiveWorkspace()

    const urlWorkspace = useMemo(() => {
        if (params.workspaceID) {
            return decodeURIComponent(params.workspaceID)
        }
        return null
    }, [params.workspaceID])

    const isReady = useLoadUsers()
    if (!isReady) return <MainPageSkeleton />

    const currentWorkspace = urlWorkspace || activeWorkspaceName
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