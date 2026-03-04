import { useState } from "react"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { Sidebar, SidebarProvider, SidebarInset, useSidebar } from "@components/ui/sidebar"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"

const DirectMessagesHeader = () => {
    // Direct messages sidebar is always expanded (not collapsible)
    // Total sidebar width: Workspace switcher (60px) + DMSidebar (360px) = 420px
    const headerLeft = "420px"
    const headerWidth = "calc(100% - 420px)"

    return (
        <>
            <header 
                className="flex items-center justify-between border-b bg-background py-1.5 px-2 z-10 fixed top-0 h-[36px]"
                style={{
                    left: headerLeft,
                    width: headerWidth,
                }}
            >
                <div className="flex items-center gap-4">
                    <span className="text-md font-medium">Direct Messages</span>
                </div>
            </header>
            <div className="pt-[36px] flex-1 overflow-auto">
                {/* Content area - add your direct messages content here */}
            </div>
        </>
    )
}

export default function DirectMessages() {
    const [activeDM, setActiveDM] = useState<string | null>(null)

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ "--workspace-switcher-width": "60px", "--sidebar-width": "420px" } as React.CSSProperties}>
            <SidebarProvider
                style={{
                    "--sidebar-width": "420px",
                    "--sidebar-width-icon": "60px",
                } as React.CSSProperties}
            >
                <Sidebar className="overflow-hidden h-full" data-state="expanded">
                    <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                        <WorkspaceSwitcher />
                        <div className="flex-1 flex flex-col">
                            <DMSidebar
                                workspaceName="Direct Messages"
                                activeDM={activeDM}
                                onDMClick={(email) => setActiveDM(email)}
                            />
                        </div>
                    </div>
                </Sidebar>
                <SidebarInset className="flex flex-col overflow-hidden">
                    <DirectMessagesHeader />
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
