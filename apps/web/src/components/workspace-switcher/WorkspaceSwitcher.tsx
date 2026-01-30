import * as React from "react"
import { Plus, MessagesSquare, Bell, MessageSquareText, BookmarkIcon, Settings } from "lucide-react"
import { Button } from "@components/ui/button"
import { cn } from "@lib/utils"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import NavUserMenu from "@components/features/header/NavUserMenu/NavUserMenu"
import { useActiveWorkspace } from "../../contexts/ActiveWorkspaceContext"
import useFetchWorkspaces, { WorkspaceFields } from "@hooks/fetchers/useFetchWorkspaces"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"

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
    const { data: workspacesData } = useFetchWorkspaces()
    
    // Get workspace from URL params or from context/localStorage
    const urlWorkspace = React.useMemo(() => {
        // Check if we're in a workspace route (from params - most reliable)
        if (params.workspaceID) {
            return decodeURIComponent(params.workspaceID)
        }
        // Fallback to pathname matching for channel routes (workspace-specific routes)
        const match = location.pathname.match(/^\/([^/]+)\/(channel|search)/)
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

    // Get the workspace to use for navigation (from URL, context, or localStorage)
    const getWorkspaceForNavigation = () => {
        if (urlWorkspace) return urlWorkspace
        if (activeWorkspaceName) return activeWorkspaceName
        // Fallback to last workspace from localStorage
        try {
            const lastWorkspace = JSON.parse(localStorage.getItem('ravenLastWorkspace') ?? '""') ?? ''
            return lastWorkspace || null
        } catch {
            return null
        }
    }
    
    // Update active workspace based on URL
    React.useEffect(() => {
        if (urlWorkspace && workspacesData?.message) {
            const workspace = workspacesData.message.find(w => w.name === urlWorkspace)
            if (workspace) {
                setActiveWorkspaceName(workspace.name)
                // Save to localStorage
                localStorage.setItem('ravenLastWorkspace', JSON.stringify(workspace.name))
            }
        }
    }, [urlWorkspace, setActiveWorkspaceName, workspacesData])

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
                "border-r border-border/40 bg-sidebar shrink-0 relative group/workspace-sidebar flex flex-col h-full",
                standalone && "fixed top-0 left-0 z-10"
            )}
            style={{ width: "var(--workspace-switcher-width, 60px)" } as React.CSSProperties}
        >
            <div className="flex flex-col items-center gap-3 py-4 flex-1">
                {/* Notifications button - first item */}
                <div
                    className="relative group/notifications-item cursor-pointer w-full flex justify-center"
                    onClick={() => {
                        navigate("/notifications")
                    }}
                >
                    <div
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ease-out",
                            location.pathname === "/notifications"
                                ? "h-8 bg-foreground"
                                : "h-2 bg-transparent group-hover/notifications-item:bg-foreground/40 group-hover/notifications-item:h-2",
                        )}
                    />
                            <div
                                className={cn(
                                    "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-250 ease-out",
                                    "bg-[oklch(0.99_0_0)] dark:bg-[oklch(0.25_0_0)] border border-border/80 dark:border-border/60",
                                    location.pathname === "/notifications"
                                ? "shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.05),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.05)] dark:shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.15),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.02)]"
                                : "shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.5px_-0.5px_1px_rgba(255,255,255,0.01)]",
                            "group-hover/notifications-item:-translate-y-px group-hover/notifications-item:scale-[1.02]",
                            "group-hover/notifications-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.05),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.05)] dark:group-hover/notifications-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.13),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.018)]"
                        )}
                    >
                        <Bell 
                            className={cn(
                                "relative w-3.5 h-3.5 text-foreground transition-all duration-250 ease-out",
                                location.pathname === "/notifications" ? "opacity-100" : "opacity-70 dark:opacity-100",
                                "group-hover/notifications-item:scale-105 group-hover/notifications-item:opacity-85 dark:group-hover/notifications-item:opacity-100"
                            )}
                            fill={location.pathname === "/notifications" ? "currentColor" : "none"}
                        />
                    </div>
                </div>

                {/* DMs button - second item */}
                <div
                    className="relative group/dm-item cursor-pointer w-full flex justify-center"
                    onClick={() => {
                        navigate("/direct-messages")
                    }}
                >
                    <div
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-250 ease-out",
                            location.pathname === "/direct-messages"
                                ? "h-8 bg-foreground"
                                : "h-2 bg-transparent group-hover/dm-item:bg-foreground/40 group-hover/dm-item:h-2",
                        )}
                    />
                    <div
                        className={cn(
                            "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-250 ease-out",
                            "bg-[oklch(0.99_0_0)] dark:bg-[oklch(0.25_0_0)] border border-border/80 dark:border-border/60",
                                    location.pathname === "/direct-messages" 
                                        ? "shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.05),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.05)] dark:shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.15),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.02)]"
                                        : "shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.5px_-0.5px_1px_rgba(255,255,255,0.01)]",
                            "group-hover/dm-item:-translate-y-px group-hover/dm-item:scale-[1.02]",
                            "group-hover/dm-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.05),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.05)] dark:group-hover/dm-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.13),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.018)]"
                        )}
                    >
                        <MessagesSquare 
                            className={cn(
                                "relative w-3.5 h-3.5 text-foreground transition-all duration-250 ease-out",
                                location.pathname === "/direct-messages" ? "opacity-100" : "opacity-70 dark:opacity-100",
                                "group-hover/dm-item:scale-105 group-hover/dm-item:opacity-85 dark:group-hover/dm-item:opacity-100"
                            )}
                            fill={location.pathname === "/direct-messages" ? "currentColor" : "none"}
                        />
                    </div>
                </div>

                {/* Threads button - third item */}
                <div
                    className="relative group/threads-item cursor-pointer w-full flex justify-center"
                    onClick={() => {
                        navigate("/threads")
                    }}
                >
                    <div
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ease-out",
                            location.pathname === "/threads"
                                ? "h-8 bg-foreground"
                                : "h-2 bg-transparent group-hover/threads-item:bg-foreground/40 group-hover/threads-item:h-2",
                        )}
                    />
                            <div
                                className={cn(
                                    "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-250 ease-out",
                                    "bg-[oklch(0.99_0_0)] dark:bg-[oklch(0.25_0_0)] border border-border/80 dark:border-border/60",
                                    location.pathname === "/threads"
                                ? "shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.05),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.05)] dark:shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.15),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.02)]"
                                : "shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.5px_-0.5px_1px_rgba(255,255,255,0.01)]",
                            "group-hover/threads-item:-translate-y-px group-hover/threads-item:scale-[1.02]",
                            "group-hover/threads-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.05),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.05)] dark:group-hover/threads-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.13),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.018)]"
                        )}
                    >
                        <MessageSquareText 
                            className={cn(
                                "relative w-3.5 h-3.5 text-foreground transition-all duration-250 ease-out",
                                location.pathname === "/threads" ? "opacity-100" : "opacity-70 dark:opacity-100",
                                "group-hover/threads-item:scale-105 group-hover/threads-item:opacity-85 dark:group-hover/threads-item:opacity-100"
                            )}
                            fill={location.pathname === "/threads" ? "currentColor" : "none"}
                        />
                    </div>
                </div>

                {/* Rest of workspace items */}
                {workspacesData?.message
                    ?.filter((workspace) => workspace.workspace_member_name) // Only show workspaces user is a member of
                    .map((workspace) => {
                        const isOnSpecialPage = location.pathname === "/notifications" || location.pathname === "/direct-messages" || location.pathname === "/threads"
                        const isActive = !isOnSpecialPage && urlWorkspace === workspace.name
                        const logo = getLogo(workspace)
                        
                        return (
                            <div
                                key={workspace.name}
                                className="relative group/workspace-item cursor-pointer w-full flex justify-center"
                                onClick={() => handleWorkspaceClick(workspace)}
                            >
                                <div
                                    className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
                                        isActive
                                            ? "h-8 bg-foreground"
                                            : "h-2 bg-transparent group-hover/workspace-item:bg-foreground/40 group-hover/workspace-item:h-2",
                                    )}
                                />

                                <div
                                    className={cn(
                                        "relative flex items-center justify-center w-8 h-8 transition-all duration-200 shadow-sm rounded-md bg-white dark:bg-gray-800",
                                        isActive && "shadow-md",
                                    )}
                                >
                                <Avatar className="w-8 h-8 rounded-md border border-[#F0F0F380] dark:border-[#2D2D3180]">
                                        <AvatarImage src={logo} alt={workspace.workspace_name} />
                                        <AvatarFallback className="text-xs">{workspace.workspace_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        )
                    })}

                {/* Add workspace button */}
                <div
                    className="relative group/add-workspace-item cursor-pointer w-full flex justify-center"
                    onClick={() => {
                        navigate("/workspace-explorer")
                    }}
                >
                    <div
                        className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-300 ease-out",
                            location.pathname === "/workspace-explorer"
                                ? "h-8 bg-foreground"
                                : "h-2 bg-transparent group-hover/add-workspace-item:bg-foreground/40 group-hover/add-workspace-item:h-2",
                        )}
                    />
                    <div
                        className={cn(
                            "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-250 ease-out",
                            "bg-[oklch(0.99_0_0)] dark:bg-[oklch(0.25_0_0)] border-2 border-dashed border-muted-foreground/25 dark:border-muted-foreground/40",
                            location.pathname === "/workspace-explorer"
                                ? "shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.05),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.05)] dark:shadow-[inset_0.5px_0.5px_1px_rgba(0,0,0,0.15),inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.02)] border-muted-foreground/50"
                                : "shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.5px_-0.5px_1px_rgba(255,255,255,0.01)]",
                            "group-hover/add-workspace-item:-translate-y-px group-hover/add-workspace-item:scale-[1.02]",
                            "group-hover/add-workspace-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.05),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.05)] dark:group-hover/add-workspace-item:shadow-[0.75px_0.75px_1.5px_rgba(0,0,0,0.13),-0.75px_-0.75px_1.5px_rgba(255,255,255,0.018)]",
                            "group-hover/add-workspace-item:border-muted-foreground/35"
                        )}
                    >
                        <Plus 
                            className={cn(
                                "relative w-3.5 h-3.5 text-muted-foreground/70 dark:text-muted-foreground transition-all duration-250 ease-out",
                                location.pathname === "/workspace-explorer" ? "opacity-100 text-foreground" : "opacity-70 dark:opacity-100",
                                "group-hover/add-workspace-item:scale-105 group-hover/add-workspace-item:opacity-85 dark:group-hover/add-workspace-item:opacity-100 group-hover/add-workspace-item:text-foreground/80 dark:group-hover/add-workspace-item:text-foreground"
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 pb-4">
                <div className="flex flex-col items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-sm transition-all duration-200",
                            location.pathname === "/saved-messages"
                                ? "bg-muted dark:bg-muted/80"
                                : ""
                        )}
                        onClick={() => {
                            navigate("/saved-messages")
                        }}
                    >
                        <BookmarkIcon className={cn(
                            "h-3.5 w-3.5",
                            location.pathname === "/saved-messages" ? "opacity-100" : "opacity-70 dark:opacity-100"
                        )} />
                        <span className="sr-only">Saved</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-sm transition-all duration-200",
                            location.pathname.startsWith("/settings")
                                ? "bg-muted dark:bg-muted/80"
                                : ""
                        )}
                        onClick={() => navigate("/settings/profile")}
                    >
                        <Settings className={cn(
                            "h-3.5 w-3.5",
                            location.pathname.startsWith("/settings") ? "opacity-100" : "opacity-70 dark:opacity-100"
                        )} />
                        <span className="sr-only">Settings</span>
                    </Button>
                </div>
                <NavUserMenu
                    user={{
                        name: "John Doe",
                        email: "john.doe@example.com",
                        avatar: "https://github.com/shadcn.png"
                    }}
                />
            </div>
        </div>
    )
}
