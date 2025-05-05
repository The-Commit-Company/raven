import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { SidebarTrigger } from "@components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { ChevronDown, FileText, Hash, Headset, Info, Pin, Star, User } from "lucide-react"

const ChannelHeader = () => {
    return (
        <div className="sticky top-0 flex items-center justify-between border-b bg-background py-1.5 px-2">
            {/* Left side */}
            <div className="flex items-center gap-2">

                <div className="flex items-center gap-1">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-6">
                        <Separator orientation="vertical" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Star className="h-3 w-3 text-muted-foreground" />
                                <span className="sr-only">Star</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Star</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="flex items-center gap-1">
                        <Hash className="size-3.5" strokeWidth={2.4} />
                        <span className="text-md font-medium">general</span>
                        <ChevronDown className="size-3.5" />
                    </div>
                </div>

                <div className="flex items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="sr-only">Files</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Files</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="default" className="h-8 px-1 gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="sr-only">Members</span>
                                <span className="text-muted-foreground text-sm font-normal">587</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Members</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="default" className="h-8 px-1 gap-2">
                                <Pin className="h-3 w-3 text-muted-foreground" />
                                <span className="sr-only">Pinned</span>
                                <span className="text-muted-foreground text-sm font-normal">3</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Pinned</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="default" className="h-8 px-1 gap-2">
                    <Headset className="size-3.5" />
                    <span className="text-sm">Start call</span>
                </Button>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Info className="size-4" />
                            <span className="sr-only">Channel Info</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Channel Info</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}

export default ChannelHeader