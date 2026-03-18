import { useState } from 'react'
import { Check, MoreVertical } from 'lucide-react'
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
import { useNavigate } from 'react-router-dom'

export const CustomizeSidebarButton = ({ showMyChannelsOnly, setShowMyChannelsOnly }: { showMyChannelsOnly: boolean, setShowMyChannelsOnly: (showMyChannelsOnly: boolean) => void }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const navigate = useNavigate()

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="md:max-w-[70vw] h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
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
                <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="min-w-48">
                    <DropdownMenuItem onClick={() => setShowMyChannelsOnly(!showMyChannelsOnly)}>
                        <span>{_("Only show my channels")}</span>{showMyChannelsOnly && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <span>{_("Customize my sidebar")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/channels')}>
                        <span>{_("Manage Channels")}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

