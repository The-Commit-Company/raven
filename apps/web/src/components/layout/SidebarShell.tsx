import * as React from "react"
import { Sidebar } from "@components/ui/sidebar"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"

export type SidebarShellProps = {
    /** Content next to WorkspaceSwitcher (e.g. ChannelSidebar or DMSidebar). */
    children: React.ReactNode
    /** Passed to Sidebar (e.g. collapsible="icon", data-state="expanded"). */
    className?: string
} & Omit<React.ComponentProps<typeof Sidebar>, "children" | "className">

/**
 * Shared sidebar structure: Sidebar > [WorkspaceSwitcher | content column].
 * Used by both workspace (AppSidebar) and DM (DirectMessages) so the shell is defined in one place.
 */
export function SidebarShell({ children, className, ...props }: SidebarShellProps) {
    return (
        <Sidebar className={className} {...props}>
            <div className="flex h-full *:data-[sidebar=sidebar]:flex-row">
                <WorkspaceSwitcher />
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        </Sidebar>
    )
}
