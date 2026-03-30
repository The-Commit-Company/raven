import * as React from "react"
import { SidebarProvider, Sidebar, SidebarInset } from "@components/ui/sidebar"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"

const WORKSPACE_SWITCHER_WIDTH = "60px"

export interface AppLayoutProps {
    /**
     * Full sidebar element (Sidebar with WorkspaceSwitcher + content inside).
     * When null, layout is "sidebar-less": only workspace switcher rail + main content.
     */
    sidebar: React.ReactNode | null
    /** Top bar / header above main content. Can be null. */
    header: React.ReactNode | null
    /** Main content (e.g. Outlet). */
    children: React.ReactNode
    /** Sidebar width CSS value (e.g. "340px", "380px"). Used for provider vars. */
    sidebarWidth: string
}

/**
 * Shared app shell: sidebar (or switcher-only) + header + content.
 * Used by both workspace (MainPage) and DM (DirectMessages) layouts so layout behavior stays in one place.
 */
export function AppLayout({ sidebar, header, children, sidebarWidth }: AppLayoutProps) {
    const providerStyle = {
        "--sidebar-width": sidebarWidth,
        "--sidebar-width-icon": "60px",
        "--app-header-height": "36px",
        "--workspace-switcher-width": WORKSPACE_SWITCHER_WIDTH,
    } as React.CSSProperties

    const wrapperStyle = {
        "--workspace-switcher-width": WORKSPACE_SWITCHER_WIDTH,
    } as React.CSSProperties

    if (sidebar === null) {
        return (
            <div className="flex flex-col h-screen" style={wrapperStyle}>
                <WorkspaceSwitcher standalone />
                <SidebarProvider style={providerStyle}>
                    <SidebarInset
                        className="overflow-hidden"
                        style={{ marginLeft: `var(--workspace-switcher-width, ${WORKSPACE_SWITCHER_WIDTH})` } as React.CSSProperties}
                    >
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </div>
        )
    }

    return (
        <div
            className="flex flex-col h-screen min-h-0 overflow-hidden"
            style={{ ...wrapperStyle, "--sidebar-width": sidebarWidth } as React.CSSProperties}
        >
            <SidebarProvider className="flex-1 min-h-0 min-w-0" style={providerStyle}>
                {sidebar}
                <SidebarInset className="flex flex-1 flex-col min-h-0 overflow-hidden">
                    {header}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
