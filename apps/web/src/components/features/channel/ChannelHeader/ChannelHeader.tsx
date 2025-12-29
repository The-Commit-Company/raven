import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { SidebarTrigger } from "@components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { FileText, Headset, Info, Link, MessageSquareText, Pin, Star } from "lucide-react"
import ChannelMembers from "./ChannelMembers"
import ChannelMenu from "./ChannelMenu"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"

const ChannelHeader = () => {

    const channelID = useCurrentChannelID()

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
        <div className="sticky top-(--app-header-height) flex items-center justify-between border-b bg-background py-1.5 px-2">
            {/* Left side */}
            <div className="flex items-center gap-2">

                <div className="flex items-center gap-1">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-6">
                        <Separator orientation="vertical" />
                    </div>
                </div>

                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenFiles}>
                                <FileText className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Files</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Files</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenLinks}>
                                <Link className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Links</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Links</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenThreads}>
                                <MessageSquareText className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Threads</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Threads</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="default" className="h-8 gap-2" onClick={onOpenPins}>
                                <Pin className="h-3 w-3 text-foreground/80" />
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
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="default" className="h-8 gap-2">
                    <Headset className="size-3.5" />
                    <span className="text-sm">Start call</span>
                </Button>
                <ChannelMembers onClick={onOpenMembers} />

                <ChannelInfoToggle />

            </div>
        </div>
    )
}

const ChannelInfoToggle = () => {

    const channelID = useCurrentChannelID()

    const [drawerType, setDrawerType] = useAtom(channelDrawerAtom(channelID))

    const onOpenSettings = () => {
        if (['info', 'files', 'links', 'threads', 'pins'].includes(drawerType)) setDrawerType('')
        else setDrawerType('info')
    }

    return <Tooltip>
        <TooltipTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onOpenSettings}>
                <Info className="size-4" />
                <span className="sr-only">Channel Info</span>
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>Channel Info</p>
        </TooltipContent>
    </Tooltip>
}

export default ChannelHeader