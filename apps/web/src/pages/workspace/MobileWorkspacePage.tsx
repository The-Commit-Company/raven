import { SidebarProvider } from "@components/ui/sidebar"
import { ChannelSidebar } from "@components/channel-sidebar/ChannelSidebar"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { useNavigate, useParams } from "react-router-dom"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { Button } from "@components/ui/button"
import { Command } from "lucide-react"
import { useSetAtom } from "jotai"
import { commandMenuOpenAtom } from "@components/features/cmdk/atoms"
import CommandMenu from "@components/features/cmdk/CommandMenu"
import _ from "@lib/translate"

interface MobileWorkspacePageProps {
    workspaceName: string
}

export function MobileWorkspacePage({ workspaceName }: MobileWorkspacePageProps) {
    const navigate = useNavigate()
    const { workspaceID } = useParams()
    const setCommandMenuOpen = useSetAtom(commandMenuOpenAtom)

    const handleChannelClick = (channel: ChannelListItem) => {
        const channelId = channel.name
        localStorage.setItem('ravenLastChannel', JSON.stringify(channelId))
        navigate(`/${encodeURIComponent(workspaceID ?? '')}/${encodeURIComponent(channelId)}`)
    }

    return (
        <SidebarProvider>
            <CommandMenu />
            <div className="flex h-screen w-full bg-surface-menu-bar">
                <WorkspaceSwitcher />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div
                        className="flex items-center justify-between pl-3 pr-1 border-b shrink-0"
                        style={{ height: "var(--app-header-height, 36px)" }}
                    >
                        <span className="text-sm font-medium text-ink-gray-8 truncate">
                            {workspaceName}
                        </span>
                        <Button
                            variant="ghost"
                            size="md"
                            isIconButton
                            onClick={() => setCommandMenuOpen(true)}
                            aria-label={_("Command Menu")}
                        >
                            <Command className="h-4 w-4 text-ink-gray-7" />
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                        <ChannelSidebar onChannelClick={handleChannelClick} />
                    </div>
                </div>
            </div>
        </SidebarProvider>
    )
}
