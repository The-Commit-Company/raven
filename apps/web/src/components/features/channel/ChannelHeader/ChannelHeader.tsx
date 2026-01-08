import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { SidebarTrigger } from "@components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { FileText, Headset, Link, MessageSquareText, Pin, Star, Search } from "lucide-react"
import ChannelMembers from "./ChannelMembers"
import ChannelMenu from "./ChannelMenu"
import { useAtom } from "jotai"
import { channelDrawerAtom } from "@utils/channelAtoms"
import { useCurrentChannelID } from "@hooks/useCurrentChannelID"
import SearchBar from "../../header/QuickSearch/SearchBar"
import { useNavigate, useLocation } from "react-router-dom"

interface ChannelHeaderProps {
    searchValue?: string
    onSearchChange?: (value: string) => void
}

const ChannelHeader = ({ searchValue, onSearchChange }: ChannelHeaderProps) => {
    const channelID = useCurrentChannelID()
    const navigate = useNavigate()
    const location = useLocation()
    const isSearchPage = location.pathname === "/search"

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
        <div className="sticky top-0 flex items-center justify-between border-b bg-background py-1.5 px-2 z-50">
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

            {/* Center - Search bar */}
            <div className="flex items-center gap-2 flex-1 ml-2 mr-2">
                {isSearchPage ? (
                    <SearchBar value={searchValue || ""} onChange={onSearchChange || (() => { })} />
                ) : (
                    <SearchBar value={""} onChange={() => { }} />
                )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1">
                {!isSearchPage && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-sm"
                                onClick={() => navigate("/search")}
                            >
                                <Search className="h-3 w-3 text-foreground/80" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Search</p>
                        </TooltipContent>
                    </Tooltip>
                )}
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