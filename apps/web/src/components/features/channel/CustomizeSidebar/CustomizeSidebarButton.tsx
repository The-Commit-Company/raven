import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from '@components/ui/button'
import {
    Dialog,
    DialogContent,
} from '@components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { CustomizeSidebarDialog } from './CustomizeSidebarDialog'
import _ from "@lib/translate"

export const CustomizeSidebarButton = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [showMyChannelsOnly, setShowMyChannelsOnly] = useState(false)

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[960px] h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                    <CustomizeSidebarDialog
                        onClose={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-sm hover:bg-accent"
                        aria-label="More options"
                    >
                        <MoreVertical className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-48">
                    <DropdownMenuItem onClick={() => setShowMyChannelsOnly(!showMyChannelsOnly)}>
                        <span>{_("Only show my channels")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <span>{_("Customize my sidebar")}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

