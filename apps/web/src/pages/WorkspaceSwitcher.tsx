import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import useFetchWorkspaces from "@hooks/fetchers/useFetchWorkspaces"
import { WorkspaceSwitcher as WorkspaceSwitcherSidebar } from "@components/workspace-switcher/WorkspaceSwitcher"

// Routes that need the workspace switcher sidebar wrapper
// All other routes (MainPage, AppSettings, etc.) handle their own layouts
const ROUTES_NEEDING_WORKSPACE_SWITCHER = ["/", "/workspace-explorer"]

const WorkspaceSwitcher = () => {
    const { data, isLoading, error } = useFetchWorkspaces()
    const location = useLocation()
    
    const shouldShowWorkspaceSwitcher = ROUTES_NEEDING_WORKSPACE_SWITCHER.includes(location.pathname)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-screen animate-fadein">
                <div className="text-center">
                    <h1 className="text-4xl font-semibold tracking-normal mb-2">raven</h1>
                    <p className="text-muted-foreground font-medium">Setting up your workspace...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">There was an error while fetching your workspaces.</h2>
                    <p className="text-muted-foreground">{error.message || "An unknown error occurred"}</p>
                </div>
            </div>
        )
    }

    if (data && data?.message.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen w-screen animate-fadein">
                <div className="text-center">
                    <h1 className="text-4xl font-semibold tracking-normal mb-2">raven</h1>
                    <p className="text-muted-foreground font-medium">You have not set up any workspaces yet.</p>
                </div>
            </div>
        )
    }

    if (data) {
        // Only wrap with workspace switcher layout for specific routes
        if (shouldShowWorkspaceSwitcher) {
            return (
                <div className="flex flex-col h-full overflow-hidden" style={{ "--workspace-switcher-width": "60px" } as React.CSSProperties}>
                    <WorkspaceSwitcherSidebar standalone />
                    <div className="flex flex-col h-full overflow-hidden" style={{ marginLeft: "var(--workspace-switcher-width, 60px)", width: "calc(100% - var(--workspace-switcher-width, 60px))" } as React.CSSProperties}>
                        <Outlet />
                    </div>
                </div>
            )
        }
        
        // For other routes, just render the outlet (they handle their own layouts)
        return <Outlet />
    }

    return (
        <div className="flex justify-center items-center h-screen w-screen animate-fadein">
            <div className="text-center">
                <h1 className="text-4xl font-semibold tracking-normal mb-2">raven</h1>
                <p className="text-muted-foreground font-medium">Setting up your workspace...</p>
            </div>
        </div>
    )
}

export default WorkspaceSwitcher
