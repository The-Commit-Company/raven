import { Button } from "@components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { FileText, Headset, Link, MessageSquareText, Pin, Star } from "lucide-react"
import ChannelMembers from "./ChannelMembers"
import ChannelMenu from "./ChannelMenu"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import { useSidebar } from "@components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { SIDEBAR_LESS_ROUTES } from "@utils/routes"

const ChannelHeader = () => {
    const channelID = useCurrentChannelID()
    const location = useLocation()
    const pathname = location.pathname
    const isSettingsPage = pathname.startsWith("/settings")
    const isSidebarLessPage = SIDEBAR_LESS_ROUTES.has(pathname) || isSettingsPage
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))


    const onOpenMembers = () => {
        if (drawerType === 'members') setDrawerType('')
        else setDrawerType('members')
    }

    const onOpenFiles = () => {
        setDrawerType('files')
    }

    const onOpenLinks = () => {
        setDrawerType('links')
    }

    const onOpenThreads = () => {
        setDrawerType('threads')
    }

    const onOpenPins = () => {
        setDrawerType('pins')
    }

    return (
        <div 
            className="fixed flex items-center justify-between border-b bg-background py-1.5 px-2 z-40 transition-[left,width,top] duration-200 ease-linear"
            style={{
                top: "var(--app-header-height, 36px)",
                left: isSidebarLessPage
                    ? "var(--workspace-switcher-width, 60px)"
                    : (isCollapsed
                        ? "var(--sidebar-width-icon, 60px)"
                        : "var(--sidebar-width, 340px)"),
                width: isSidebarLessPage
                    ? "calc(100% - var(--workspace-switcher-width, 60px))"
                    : (isCollapsed
                        ? "calc(100% - var(--sidebar-width-icon, 60px))"
                        : "calc(100% - var(--sidebar-width, 340px))"),
            }}
        >
            {/* Left side */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                                <Star className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Star</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Star</p>
                        </TooltipContent>
                    </Tooltip>

                    <ChannelMenu />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onOpenFiles}>
                                <FileText className="h-2 w-2 text-foreground/80" />
                                <span className="sr-only">Files</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Files</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onOpenLinks}>
                                <Link className="h-2 w-2 text-foreground/80" />
                                <span className="sr-only">Links</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Links</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onOpenThreads}>
                                <MessageSquareText className="h-2 w-2 text-foreground/80" />
                                <span className="sr-only">Threads</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Threads</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="default" className="h-7 gap-2 rounded-sm" onClick={onOpenPins}>
                                <Pin className="h-2 w-2 text-foreground/80" />
                                <span className="sr-only">Pinned</span>
                                <span className="text-muted-foreground text-sm font-normal">3</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Pinned Messages</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                            <Headset className="h-3 w-3 text-foreground/80" />
                            <span className="sr-only">Start call</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Start call</p>
                    </TooltipContent>
                </Tooltip>
                <ChannelMembers onClick={onOpenMembers} />
            </div>
        </div>
    )
}

export default ChannelHeader