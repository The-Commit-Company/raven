import { Button } from "@components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { FileText, Headset, MoreHorizontal, Search } from "lucide-react"

export function DMChannelHeaderMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                    <MoreHorizontal className="h-4 w-4 text-foreground/80" />
                    <span className="sr-only">Options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <Search className="h-4 w-4" />
                    Search
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <FileText className="h-4 w-4" />
                    View Files
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 py-2 text-sm">
                    <Headset className="h-4 w-4" />
                    Start a call
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
