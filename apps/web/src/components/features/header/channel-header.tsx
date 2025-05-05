import { Separator } from "@components/ui/separator"
import { SidebarTrigger } from "@components/ui/sidebar"
import { ChevronDown, FileText, Hash, Headset, Settings2, Star } from "lucide-react"

export const ChannelHeader = () => {
    return (
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background py-1.5 px-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-2" />
            <div className="flex flex-row items-center gap-4">
                <Star className="size-4" />
                <div className="flex flex-row items-center gap-1">
                    <Hash className="size-4" strokeWidth={2.4} />
                    <span className="text-md font-medium">Channel Name</span>
                    <div className="mt-0.5">
                        <ChevronDown className="size-4" strokeWidth={2} />
                    </div>
                </div>
            </div>
            <FileText className="size-4" />
            <div className="flex flex-row items-center gap-2 bg-accent py-1 px-2 rounded-md">
                <Headset className="size-3.5" />
                <span className="text-sm" >Start call</span>
            </div>
            <Settings2 className="size-4" />
        </header>
    )
}