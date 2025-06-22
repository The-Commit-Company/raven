import { AppSidebar } from "@components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@components/ui/sidebar"
import AppHeader from "@components/features/header/AppHeader"
import { Outlet } from "react-router-dom"

const MainPage = () => {
    return (
        <div className="flex flex-col h-screen">
            <AppHeader />
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "360px",
                        paddingTop: "var(--app-header-height)",
                    } as React.CSSProperties
                }>
                <AppSidebar />
                <SidebarInset>
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

export default MainPage