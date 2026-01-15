import * as React from "react"
import { Plus, MessageCircle, Bell, MessageSquareText, BookmarkIcon, Settings } from "lucide-react"
import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import { useNavigate, useLocation } from "react-router-dom"
import NavUserMenu from "@components/features/header/NavUserMenu/NavUserMenu"
import { useActiveWorkspace } from "../../contexts/ActiveWorkspaceContext"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    workspaces: [
        {
            name: "ERPNext",
            icon: "https://frappe.io/files/erpnext53456f.png",
            isActive: true,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 4,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Public", unread: 5 },
                { id: "bugs", name: "bugs", type: "channel", channelType: "Open", unread: 0 },
                { id: "features", name: "features", type: "channel", channelType: "Private", unread: 12 },
                { id: "releases", name: "releases", type: "channel", channelType: "Public", unread: 0 },
            ],
        },
        {
            name: "Helpdesk",
            icon: "https://frappe.io/files/helpdesk8109cf.png",
            isActive: false,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 5,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Public", unread: 0 },
                { id: "academics", name: "academics", type: "channel", channelType: "Open", unread: 3 },
                { id: "research", name: "research", type: "channel", channelType: "Private", unread: 0 },
            ],
        },
        {
            name: "Frappe School",
            icon: "https://frappe.io/files/school.png",
            isActive: false,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 2,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Open", unread: 0 },
                { id: "standup", name: "standup", type: "channel", channelType: "Public", unread: 7 },
                { id: "random", name: "random", type: "channel", channelType: "Private", unread: 0 },
            ],
        },
        {
            name: "Frappe HR",
            icon: "https://frappe.io/files/hrbde4d8.png",
            isActive: false,
            color: "bg-white",
            textColor: "text-gray-900",
            notificationCount: 0,
            channels: [
                { id: "general", name: "general", type: "channel", channelType: "Public", unread: 0 },
                { id: "projects", name: "projects", type: "channel", channelType: "Open", unread: 0 },
            ],
        },
        {
            name: "Direct Messages",
            icon: MessageCircle,
            isActive: false,
            color: "bg-slate-900 dark:bg-slate-100",
            textColor: "text-slate-100 dark:text-slate-900",
            notificationCount: 0,
            channels: [
                { id: "alice", name: "Alice", type: "dm", unread: 0 },
                { id: "bob", name: "Bob", type: "dm", unread: 2 },
            ],
        },
    ],
}

interface WorkspaceSwitcherProps {
    standalone?: boolean
}

export function WorkspaceSwitcher({ standalone = false }: WorkspaceSwitcherProps = {}) {
    const navigate = useNavigate()
    const location = useLocation()
    const { setActiveWorkspaceName } = useActiveWorkspace()
    const [activeWorkspace, setActiveWorkspace] = React.useState(data.workspaces[0])
    
    // Get workspace from URL params
    const urlWorkspace = React.useMemo(() => {
        const match = location.pathname.match(/^\/([^/]+)\/channel\//)
        if (match) {
            return decodeURIComponent(match[1])
        }
        return null
    }, [location.pathname])
    
    // Update active workspace based on URL
    React.useEffect(() => {
        if (urlWorkspace) {
            const workspace = data.workspaces.find(w => w.name === urlWorkspace)
            if (workspace) {
                setActiveWorkspace(workspace)
                setActiveWorkspaceName(workspace.name)
            }
        }
    }, [urlWorkspace, setActiveWorkspaceName])

    const handleWorkspaceClick = (workspace: typeof data.workspaces[0]) => {
        setActiveWorkspace(workspace)
        setActiveWorkspaceName(workspace.name)
        const workspaceSlug = encodeURIComponent(workspace.name)
        const channelId = workspace.channels[0]?.id || workspace.channels[0]?.name || "general"
        navigate(`/${workspaceSlug}/channel/${channelId}`)
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="relative group/notifications-item cursor-pointer w-full flex justify-center"
                            onClick={() => {
                                navigate("/mentions")
                            }}
                        >
                            <div
                                className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
                                    location.pathname === "/mentions"
                                        ? "h-8 bg-foreground"
                                        : "h-2 bg-transparent group-hover/notifications-item:bg-foreground/60 group-hover/notifications-item:h-2",
                                )}
                            />
                            <div
                                className={cn(
                                    "relative flex items-center justify-center w-8 h-8 transition-all duration-200 shadow-sm rounded-md bg-slate-900 dark:bg-slate-100",
                                    location.pathname === "/mentions" && "shadow-md",
                                )}
                            >
                                <Bell className={cn(
                                    "w-3.5 h-3.5 text-slate-100 dark:text-slate-900"
                                )} />
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Notifications</p>
                    </TooltipContent>
                </Tooltip>

                {/* DMs button - second item */}
                {(() => {
                    const dmWorkspace = data.workspaces.find(w => w.name === "Direct Messages")
                    if (!dmWorkspace) return null
                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="relative group/dm-item cursor-pointer w-full flex justify-center"
                                    onClick={() => {
                                        navigate("/direct-messages")
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
                                            location.pathname === "/direct-messages"
                                                ? "h-8 bg-foreground"
                                                : "h-2 bg-transparent group-hover/dm-item:bg-foreground/60 group-hover/dm-item:h-2",
                                        )}
                                    />
                                    <div
                                        className={cn(
                                            "relative flex items-center justify-center w-8 h-8 transition-all duration-200 shadow-sm rounded-md",
                                            dmWorkspace.color,
                                            location.pathname === "/direct-messages" && "shadow-md",
                                        )}
                                    >
                                        <MessageCircle className={cn("w-3.5 h-3.5", dmWorkspace.textColor)} />
                                        {dmWorkspace.notificationCount > 0 && (
                                            <div className="absolute -bottom-0.5 -right-0.5 bg-unread rounded-full w-2 h-2 shadow-lg border border-slate-200 dark:border-slate-800" />
                                        )}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Direct Messages</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })()}

                {/* Threads button - third item */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="relative group/threads-item cursor-pointer w-full flex justify-center"
                            onClick={() => {
                                navigate("/threads")
                            }}
                        >
                            <div
                                className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200",
                                    location.pathname === "/threads"
                                        ? "h-8 bg-foreground"
                                        : "h-2 bg-transparent group-hover/threads-item:bg-foreground/60 group-hover/threads-item:h-2",
                                )}
                            />
                            <div
                                className={cn(
                                    "relative flex items-center justify-center w-8 h-8 transition-all duration-200 shadow-sm rounded-md bg-slate-900 dark:bg-slate-100",
                                    location.pathname === "/threads" && "shadow-md",
                                )}
                            >
                                <MessageSquareText className={cn(
                                    "w-3.5 h-3.5 text-slate-100 dark:text-slate-900"
                                )} />
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Threads</p>
                    </TooltipContent>
                </Tooltip>

                {/* Rest of workspace items (excluding Direct Messages) */}
                {data.workspaces
                    .filter(workspace => workspace.name !== "Direct Messages")
                    .map((workspace) => {
                        const isOnSpecialPage = location.pathname === "/mentions" || location.pathname === "/direct-messages" || location.pathname === "/threads"
                        const isActive = !isOnSpecialPage && (urlWorkspace === workspace.name || activeWorkspace?.name === workspace.name)
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
                                            : "h-2 bg-transparent group-hover/workspace-item:bg-foreground/60 group-hover/workspace-item:h-2",
                                    )}
                                />

                                <div
                                    className={cn(
                                        "relative flex items-center justify-center w-8 h-8 transition-all duration-200 shadow-sm rounded-md",
                                        workspace.color,
                                        isActive && "shadow-md",
                                    )}
                                >
                                    {typeof workspace.icon === 'string' ? (
                                        <img
                                            src={workspace.icon}
                                            alt={workspace.name}
                                            className="w-8 h-8 object-cover rounded-md"
                                        />
                                    ) : (
                                        <workspace.icon className={cn("w-3.5 h-3.5", workspace.textColor)} />
                                    )}
                                    {workspace.notificationCount > 0 && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-unread rounded-full w-2 h-2 shadow-lg border border-slate-200 dark:border-slate-800" />
                                    )}
                                </div>
                            </div>
                        )
                    })}

                <div className="relative group cursor-pointer mt-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-background border-2 border-dashed border-muted-foreground/25 text-muted-foreground rounded-md hover:border-muted-foreground/50 hover:text-foreground transition-all duration-200">
                        <Plus className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 pb-4">
                <div className="flex flex-col items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-sm"
                                onClick={() => navigate("/saved-messages")}
                            >
                                <BookmarkIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">Saved</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Saved</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-sm"
                                onClick={() => navigate("/settings")}
                            >
                                <Settings className="h-3.5 w-3.5" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
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
