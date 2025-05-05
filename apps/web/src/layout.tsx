import { AppSidebar } from "./components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@components/ui/sidebar"
import AppHeader from "@components/features/header/AppHeader"
import ChannelHeader from "@components/features/header/ChannelHeader"

export default function Page() {
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
                    <ChannelHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        {Array.from({ length: 24 }).map((_, index) => (
                            <div
                                key={index}
                                className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                            />
                        ))}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
