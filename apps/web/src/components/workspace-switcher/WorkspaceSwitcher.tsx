import * as React from "react"
import { Plus, MessagesSquare, Bell, MessageSquareText, BookmarkIcon, Settings, Search } from "lucide-react"
import { Button } from "@components/ui/button"
import { cn } from "@lib/utils"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import NavUserMenu from "@components/features/header/NavUserMenu/NavUserMenu"
import { useActiveWorkspace } from "../../contexts/ActiveWorkspaceContext"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { useWorkspaces, WorkspaceFields } from "@hooks/useWorkspaces"
import { useNotifications } from "@hooks/useNotifications"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useMemo } from "react"
import _ from "@lib/translate"

const getLogo = (workspace: WorkspaceFields) => {
    let logo = workspace.logo || ''
    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }
    return logo
}

interface WorkspaceSwitcherProps {
    standalone?: boolean
}

export function WorkspaceSwitcher({ standalone = false }: WorkspaceSwitcherProps = {}) {
    const navigate = useNavigate()
    const location = useLocation()
    const params = useParams()
    const { setActiveWorkspaceName, activeWorkspaceName } = useActiveWorkspace()
    const { workspaces } = useWorkspaces()
    const { unreadCount } = useNotifications()
    const { myProfile } = useCurrentRavenUser()

    // Get workspace from URL params or from context/localStorage
    const urlWorkspace = useMemo(() => {
        // Check if we're in a workspace route (from params - most reliable)
        if (params.workspaceID) {
            return decodeURIComponent(params.workspaceID)
        }
        // Fallback to pathname matching for channel routes (workspace-specific routes)
        const match = location.pathname.match(/^\/([^/]+)\/channel\//)
        if (match) {
            return decodeURIComponent(match[1])
        }
        // Also check if path is just /:workspaceID
        const workspaceMatch = location.pathname.match(/^\/([^/]+)$/)
        if (workspaceMatch && workspaceMatch[1] !== 'workspace-explorer' && workspaceMatch[1] !== 'settings') {
            return decodeURIComponent(workspaceMatch[1])
        }
        return null
    }, [location.pathname, params.workspaceID])

    // Update active workspace based on URL
    React.useEffect(() => {
        if (urlWorkspace && workspaces) {
            const workspace = workspaces.find(w => w.name === urlWorkspace)
            if (workspace) {
                setActiveWorkspaceName(workspace.name)
                // Save to localStorage
                localStorage.setItem('ravenLastWorkspace', JSON.stringify(workspace.name))
            }
        }
    }, [urlWorkspace, setActiveWorkspaceName, workspaces])

    const handleWorkspaceClick = (workspace: WorkspaceFields) => {
        setActiveWorkspaceName(workspace.name)
        // Save to localStorage
        localStorage.setItem('ravenLastWorkspace', JSON.stringify(workspace.name))
        localStorage.removeItem('ravenLastChannel')
        // Navigate to workspace (MainPage will handle default channel)
        navigate(`/${encodeURIComponent(workspace.name)}`)
    }

    return (
        <div
            className={cn(
                "border-r border-outline-gray-2/40 bg-surface-menu-bar shrink-0 flex flex-col h-full",
                standalone && "fixed top-0 left-0 z-10"
            )}
            style={{ width: "var(--workspace-switcher-width, 60px)" } as React.CSSProperties}
        >
            <div className="flex flex-col items-center gap-3 py-4 flex-1">
                {/* Notifications */}
                <NavItem
                    isActive={location.pathname === "/notifications"}
                    onClick={() => navigate("/notifications")}
                >
                    <Bell className="w-3.5 h-3.5 text-ink-gray-7" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-semibold leading-none">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </NavItem>

                {/* DMs */}
                <NavItem
                    isActive={location.pathname.startsWith("/dm-channel")}
                    onClick={() => navigate("/dm-channel")}
                >
                    <MessagesSquare className="w-3.5 h-3.5 text-ink-gray-7" />
                </NavItem>

                {/* Threads */}
                <NavItem
                    isActive={location.pathname === "/threads"}
                    onClick={() => navigate("/threads")}
                >
                    <MessageSquareText className="w-3.5 h-3.5 text-ink-gray-7" />
                </NavItem>

                {/* Workspaces */}
                {workspaces
                    ?.filter((workspace) => workspace.workspace_member_name) // Only show workspaces user is a member of
                    .map((workspace) => {
                        const isOnSpecialPage = location.pathname === "/notifications"
                            || location.pathname.startsWith("/dm-channel")
                            || location.pathname === "/threads"
                            || location.pathname === "/search"
                        const isActive = !isOnSpecialPage && urlWorkspace === workspace.name
                        const logo = getLogo(workspace)

                        return (
                            <div
                                key={workspace.name}
                                className="relative group/workspace-item cursor-pointer w-full flex justify-center"
                                onClick={() => handleWorkspaceClick(workspace)}
                            >
                                <ActivePill isActive={isActive} />
                                <div className={cn(
                                    "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
                                    "group-hover/workspace-item:-translate-y-px group-hover/workspace-item:scale-[1.02]",
                                )}>
                                    <Avatar className="w-8 h-8 rounded-md border border-outline-gray-2">
                                        <AvatarImage src={logo} alt={workspace.workspace_name} />
                                        <AvatarFallback className="text-xs bg-surface-gray-2 text-ink-gray-7">
                                            {workspace.workspace_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        )
                    })}

                {/* Add workspace */}
                <div
                    className="relative group/add-workspace-item cursor-pointer w-full flex justify-center"
                    onClick={() => navigate("/workspace-explorer")}
                >
                    <ActivePill isActive={location.pathname === "/workspace-explorer"} />
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
                        "border-2 border-dashed border-outline-gray-3",
                        "group-hover/add-workspace-item:-translate-y-px group-hover/add-workspace-item:scale-[1.02]",
                        "group-hover/add-workspace-item:border-outline-gray-4",
                    )}>
                        <Plus className="w-3.5 h-3.5 text-ink-gray-4" />
                    </div>
                </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col items-center gap-2 pb-4">
                <div className="flex flex-col items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        className={cn(location.pathname === "/search" && "bg-surface-gray-2")}
                        onClick={() => navigate("/search")}
                    >
                        <Search className="h-3.5 w-3.5 text-ink-gray-7" />
                        <span className="sr-only">{_("Search")}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        className={cn(location.pathname === "/saved-messages" && "bg-surface-gray-2")}
                        onClick={() => navigate("/saved-messages")}
                    >
                        <BookmarkIcon className="h-3.5 w-3.5 text-ink-gray-7" />
                        <span className="sr-only">{_("Saved")}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        className={cn(location.pathname.startsWith("/settings") && "bg-surface-gray-2")}
                        onClick={() => navigate("/settings/profile")}
                    >
                        <Settings className="h-3.5 w-3.5 text-ink-gray-7" />
                        <span className="sr-only">{_("Settings")}</span>
                    </Button>
                </div>
                {myProfile && <NavUserMenu user={myProfile} />}
            </div>
        </div>
    )
}

function ActivePill({ isActive }: { isActive: boolean }) {
    return (
        <div className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
            isActive ? "h-8 bg-ink-gray-8" : "h-2 bg-transparent"
        )} />
    )
}

function NavItem({ isActive, onClick, children }: {
    isActive: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <div
            className="relative group/nav-item cursor-pointer w-full flex justify-center"
            onClick={onClick}
        >
            <ActivePill isActive={isActive} />
            <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
                "bg-surface-cards border border-outline-gray-2 shadow-sm",
                "group-hover/nav-item:-translate-y-px group-hover/nav-item:scale-[1.02]",
                isActive && "bg-surface-gray-2"
            )}>
                {children}
            </div>
        </div>
    )
}
