import { Outlet, useLocation } from "react-router-dom"
import { useWorkspaces } from "@hooks/useWorkspaces"
import { WorkspaceSwitcher as WorkspaceSwitcherSidebar } from "@components/workspace-switcher/WorkspaceSwitcher"
import { H1, H3, Paragraph } from "@components/ui/typography"
import _ from "@lib/translate"

const WorkspaceSwitcher = () => {
    const { workspaces, isLoading, error } = useWorkspaces()

    if (isLoading) {
        return (
            // TODO: Add a skeleton loader here
            <div className="flex justify-center items-center h-screen w-screen animate-fadein">
                <div className="text-center">
                    <H1 className="text-4xl font-semibold tracking-normal mb-2">raven</H1>
                    <Paragraph className="text-ink-gray-4 font-medium">{_("Setting up your workspace...")}</Paragraph>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            // TODO: Add an error banner here
            <div className="flex justify-center items-center h-screen w-screen">
                <div className="text-center">
                    <H3 className="text-xl font-semibold mb-2">{_("There was an error while fetching your workspaces.")}</H3>
                    <Paragraph className="text-ink-gray-4">{error.message || _("An unknown error occurred")}</Paragraph>
                </div>
            </div>
        )
    }

    if (workspaces) {
        // Only wrap with workspace switcher layout for specific routes
        return (
            <div className="flex h-screen overflow-hidden">
                <WorkspaceSwitcherSidebar />
                <div className="flex-1 overflow-hidden">
                    <Outlet />
                </div>
            </div>
        )
    }

    return (
        // TODO: Add a skeleton loading state here
        <div className="flex justify-center items-center h-screen w-screen animate-fadein">
            <div className="text-center">
                <H1 className="text-4xl font-semibold tracking-normal mb-2">raven</H1>
                <Paragraph className="text-ink-gray-4 font-medium">{_("Setting up your workspace...")}</Paragraph>
            </div>
        </div>
    )
}

export default WorkspaceSwitcher
