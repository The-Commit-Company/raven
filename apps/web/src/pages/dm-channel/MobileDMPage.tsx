import { SidebarProvider } from "@components/ui/sidebar"
import { DMSidebar } from "@components/dm-sidebar/DMSidebar"
import { WorkspaceSwitcher } from "@components/workspace-switcher/WorkspaceSwitcher"
import { useNavigate } from "react-router-dom"
import { Button } from "@components/ui/button"
import { Command } from "lucide-react"
import { useSetAtom } from "jotai"
import { commandMenuOpenAtom } from "@components/features/cmdk/atoms"
import CommandMenu from "@components/features/cmdk/CommandMenu"
import { useChannels } from "@hooks/useChannels"
import _ from "@lib/translate"

export function MobileDMPage() {
    const navigate = useNavigate()
    const setCommandMenuOpen = useSetAtom(commandMenuOpenAtom)
    const { dm_channels, isLoading } = useChannels()

    const handleDMClick = (dmChannelId: string) => {
        navigate(`/dm-channel/${encodeURIComponent(dmChannelId)}`)
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
                            {_("Direct Messages")}
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
                        <DMSidebar
                            activeDMChannelId={null}
                            onDMClick={handleDMClick}
                            dmChannels={dm_channels}
                            isLoadingChannels={isLoading}
                        />
                    </div>
                </div>
            </div>
        </SidebarProvider>
    )
}
