import NavUserMenu from "@components/features/header/NavUserMenu/NavUserMenu"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Separator } from "@components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip"
import { useUnreadNotificationsCount } from "@hooks/useNotifications"
import { useWorkspaces, WorkspaceFields } from "@hooks/useWorkspaces"
import _ from "@lib/translate"
import { cn } from "@lib/utils"
import { BellIcon, BookmarkIcon, MessageSquareTextIcon, MessagesSquareIcon } from "lucide-react"
import { NavLink } from "react-router"

/**
 * Component to render the first sidebar - only used on Desktop. 
 * The component has navigation links to pages, the user avatar with logout and a settings button.
 */
const PrimarySidebar = () => {
    return (
        <TooltipProvider>
            <div className="flex flex-col h-full shrink-0 justify-between items-center border-r border-outline-gray-1 bg-surface-menu-bar w-(--primary-sidebar-width) py-4">
                <div className="flex flex-col items-center gap-3">
                    <NotificationsLink />
                    <DirectMessagesLink />
                    <ThreadsLink />

                    <div className="px-2 w-full">
                        <Separator />
                    </div>
                    <WorkspaceList />
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="px-2 w-full">
                        <Separator />
                    </div>
                    <SavedMessageLink />
                    <NavUserMenu />
                </div>
            </div>
        </TooltipProvider>
    )
}

const IconBox = ({ children, isActive, title }: { children: React.ReactNode, isActive?: boolean, title?: string }) => {
    return <Tooltip>
        <TooltipTrigger asChild>
            <div className="relative w-(--primary-sidebar-width) flex items-center justify-center group/icon-box">
                <ActivePill isActive={isActive} />
                <div data-active={isActive} className={cn(
                    "relative flex items-center justify-center size-8 [&>svg]:size-4 rounded transition-all duration-200",
                    "hover:bg-surface-gray-4 bg-surface-gray-3",
                    "data-active:bg-surface-gray-7 data-active:text-ink-white data-active:hover:bg-surface-gray-7"
                )}>
                    {children}
                </div>
            </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
            {title}
        </TooltipContent>
    </Tooltip>
}

const ActivePill = ({ isActive }: { isActive?: boolean }) => {
    return <div className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all ease-in duration-200",
        isActive ? "h-8 bg-ink-gray-8" : "group-hover/icon-box:h-2.5 h-0 bg-ink-gray-8"
    )} />
}

const UnreadBadge = ({ count }: { count?: number }) => {

    if (!count || count === 0) return null

    return <span className="absolute -top-1.5 -right-1.5 size-4 flex tabular-nums items-center justify-center rounded-full bg-surface-red-5 dark:bg-surface-red-6 text-ink-white dark:text-ink-red-1 text-[9px] leading-none">
        {count > 9 ? "9+" : count}
    </span>

}

const NotificationsLink = () => {

    const { data: unreadCountData } = useUnreadNotificationsCount()
    const unreadCount = unreadCountData?.message ?? 0

    // TODO: Add realtime event listeners here to update the unread count when new notifications are created or read

    return <NavLink to="notifications">
        {({ isActive }) => (
            <IconBox isActive={isActive} title={_("Notifications")}>
                <BellIcon />
                <UnreadBadge count={unreadCount} />
            </IconBox>
        )}
    </NavLink>
}

const DirectMessagesLink = () => {
    return <NavLink to="dm-channel">
        {({ isActive }) => (
            <IconBox isActive={isActive} title={_("Direct Messages")}>
                <MessagesSquareIcon />
            </IconBox>
        )}
    </NavLink>
}

const ThreadsLink = () => {
    return <NavLink to="threads">
        {({ isActive }) => (
            <IconBox isActive={isActive} title={_("Threads")}>
                <MessageSquareTextIcon />
            </IconBox>
        )}
    </NavLink>
}

const SavedMessageLink = () => {
    return <NavLink to="saved-messages">
        {({ isActive }) => (
            <IconBox isActive={isActive} title={_("Saved Messages")}>
                <BookmarkIcon />
            </IconBox>
        )}
    </NavLink>
}

export const getWorkspaceLogo = (workspace: WorkspaceFields) => {
    let logo = workspace.logo || ''
    if (!logo && workspace.workspace_name === 'Raven') {
        logo = '/assets/raven/raven-logo.png'
    }
    return logo
}

const WorkspaceList = () => {

    const { workspaces } = useWorkspaces()

    return <div className="flex flex-col items-center gap-3">
        {workspaces.map((workspace) => (
            <NavLink key={workspace.name} to={`/${workspace.name}`}>
                {({ isActive }) => (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative w-(--primary-sidebar-width) flex items-center justify-center group/icon-box">
                                <ActivePill isActive={isActive} />
                                <Avatar className="w-8 h-8 rounded">
                                    <AvatarImage src={getWorkspaceLogo(workspace)} alt={workspace.workspace_name} />
                                    <AvatarFallback className="text-xs bg-surface-gray-2 text-ink-gray-7">
                                        {workspace.workspace_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            {workspace.workspace_name}
                        </TooltipContent>
                    </Tooltip>
                )}
            </NavLink>
        ))}
    </div>
}

export default PrimarySidebar