import { commandMenuOpenAtom } from "@components/features/cmdk/atoms"
import NavUserMenu from "@components/features/header/NavUserMenu/NavUserMenu"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Button } from "@components/ui/button"
import { Kbd, KbdGroup } from "@components/ui/kbd"
import { KeyboardMetaKeyIcon } from "@components/ui/keyboard-keys"
import { Separator } from "@components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip"
import { useUnreadNotificationsCount } from "@hooks/useNotifications"
import { useWorkspaces } from "@hooks/useWorkspaces"
import _ from "@lib/translate"
import { cn } from "@lib/utils"
import { useSetAtom } from "jotai"
import { BellIcon, BookmarkIcon, MessageSquareTextIcon, MessagesSquareIcon, SearchIcon } from "lucide-react"
import { NavLink } from "react-router"

/**
 * Component to render the first sidebar - only used on Desktop. 
 * The component has navigation links to pages, the user avatar with logout and a settings button.
 */
const PrimarySidebar = () => {
    return (
        <TooltipProvider>
            <div className="flex flex-col h-full shrink-0 justify-between items-center border-r border-outline-gray-2 bg-surface-sidebar w-(--primary-sidebar-width) py-4">
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
                    <SearchButton />
                    <SavedMessageLink />
                    <NavUserMenu />
                </div>
            </div>
        </TooltipProvider>
    )
}

const SearchButton = () => {
    const setOpen = useSetAtom(commandMenuOpenAtom)
    return <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="subtle"
                size="md"
                className=""
                isIconButton onClick={() => setOpen(true)}
                aria-label={_("Command Menu")}>
                <SearchIcon className="size-4" />
            </Button >

        </TooltipTrigger>
        <TooltipContent side="right" align="center">
            <div className="flex items-center gap-2">
                {_("Search")}  <KbdGroup>
                    <Kbd className="text-ink-gray-4 text-sm font-normal items-center gap-0 flex justify-center">
                        <KeyboardMetaKeyIcon /> K
                    </Kbd>
                </KbdGroup>
            </div>
        </TooltipContent>

    </Tooltip>
}

const IconBox = ({ children, isActive, title }: { children: React.ReactNode, isActive?: boolean, title?: string }) => {
    return <Tooltip>
        <TooltipTrigger asChild>
            <div className="relative w-(--primary-sidebar-width) flex items-center justify-center group/icon-box">
                <ActivePill isActive={isActive} />
                <div data-active={isActive} className={cn(
                    "relative flex items-center justify-center size-8 [&>svg]:size-4 rounded transition-all duration-200",
                    "hover:bg-surface-gray-3 bg-surface-gray-2 text-ink-gray-7",
                    "data-active:bg-surface-gray-4 data-active:hover:bg-surface-gray-4"
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
        isActive ? "h-6 bg-surface-gray-7" : "group-hover/icon-box:bg-surface-gray-7 bg-transparent h-2"
    )} />
}

const UnreadBadge = ({ count }: { count?: number }) => {

    if (!count || count === 0) return null

    // Pill, not a fixed circle: a single digit stays circular (min-w == height),
    // but "9+" / two digits grow horizontally with px-1 so the glyphs aren't
    // crushed against the boundary. h-4 keeps the cap height stable either way.
    return <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 flex tabular-nums items-center justify-center rounded-full bg-surface-red-6 dark:bg-surface-red-6 text-ink-base dark:text-ink-red-1 text-[10px] font-medium leading-none">
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
                                    <AvatarImage src={workspace.logo} alt={workspace.workspace_name} />
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