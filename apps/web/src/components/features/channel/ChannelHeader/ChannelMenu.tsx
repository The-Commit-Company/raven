import { Button } from "@components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"
import { BellOff, ChevronDown, Hash, LogOut, Settings, Users } from "lucide-react"

const ChannelMenu = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="default" className="h-8">
                    <div className="flex items-center gap-1">
                        <Hash className="size-3.5" strokeWidth={2.4} />
                        <span className="text-md font-medium">Channel Name</span>
                    </div>
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <Settings className="h-4 w-4" />
                    <span>Channel settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Channel members</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <BellOff className="h-4 w-4" />
                    <span>Mute channel</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <LogOut className="h-4 w-4" />
                    <span>Leave channel</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ChannelMenu