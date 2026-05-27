import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { ChevronLeft, Headset, Pin, Star } from "lucide-react"
import ChannelMembers from "./ChannelMembers"
import ChannelMenu from "./ChannelMenu"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useSidebar } from "@components/ui/sidebar"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { SIDEBAR_LESS_ROUTES } from "@utils/routes"
import { useChannel } from "@hooks/useChannel"
import { useIsMobile } from "@hooks/use-mobile"
import _ from "@lib/translate"

const ChannelHeader = () => {
    const channelID = useCurrentChannelID()
    const { channel } = useChannel(channelID)
    const location = useLocation()
    const pathname = location.pathname
    const isSettingsPage = pathname.startsWith("/settings")
    const isSidebarLessPage = SIDEBAR_LESS_ROUTES.has(pathname) || isSettingsPage
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { toggleStarChannel, isStarred } = useChannel(channelID)
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    const pinnedCount = channel?.pinned_messages_string ? channel.pinned_messages_string.split("\n").length : 0

    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const onOpenMembers = () => {
        if (isMobile && workspaceID) {
            navigate(`/${encodeURIComponent(workspaceID)}/${encodeURIComponent(channelID)}/members`)
        } else if (drawerType === 'members') {
            setDrawerType('')
        } else {
            setDrawerType('members')
        }
    }

    const onOpenPins = () => {
        if (isMobile && workspaceID) {
            navigate(`/${encodeURIComponent(workspaceID)}/${encodeURIComponent(channelID)}/settings?tab=pins`)
            return
        }
        setDrawerType('pins')
    }

    const headerStyle = isMobile
        ? { top: 0, left: 0, width: "100%" }
        : {
            top: "var(--app-header-height, 36px)",
            left: isSidebarLessPage
                ? "var(--workspace-switcher-width, 60px)"
                : isCollapsed
                    ? "var(--sidebar-width-icon, 60px)"
                    : "var(--sidebar-width, 340px)",
            width: isSidebarLessPage
                ? "calc(100% - var(--workspace-switcher-width, 60px))"
                : isCollapsed
                    ? "calc(100% - var(--sidebar-width-icon, 60px))"
                    : "calc(100% - var(--sidebar-width, 340px))",
        }

    return (
        <div
            className="fixed flex items-center justify-between border-b bg-surface-white py-1.5 px-2 z-40 transition-[left,width,top] duration-200 ease-linear"
            style={headerStyle}
        >
            {isMobile && (
                <Button
                    variant="ghost"
                    size="sm"
                    isIconButton
                    onClick={() => navigate(`/${workspaceID ?? ''}`)}
                    aria-label={_('Back')}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            )}

            {/* Left side */}
            <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" isIconButton onClick={toggleStarChannel}>
                                <Star className={`h-3 w-3 text-ink-gray-8/80 ${isStarred ? "fill-amber-300 stroke-amber-300" : ""}`} />
                                <span className="sr-only">{_('Star')}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_('Star')}</p>
                        </TooltipContent>
                    </Tooltip>

                    <ChannelMenu channelID={channelID} />

                    {pinnedCount > 0 && <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2" onClick={onOpenPins}>
                                <Pin className="h-2 w-2 text-ink-gray-8/80" />
                                <span className="sr-only">{_('Pinned')}</span>
                                <span className="text-ink-gray-4 text-sm font-normal">{pinnedCount}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{_('Pinned Messages')}</p>
                        </TooltipContent>
                    </Tooltip>}
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" isIconButton>
                            <Headset className="h-3 w-3 text-ink-gray-8/80" />
                            <span className="sr-only">{_('Start call')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{_('Start call')}</p>
                    </TooltipContent>
                </Tooltip>
                <ChannelMembers onClick={onOpenMembers} channelID={channelID} />
            </div>
        </div>
    )
}

export default ChannelHeader