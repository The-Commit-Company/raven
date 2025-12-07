import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { Button } from '@components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@components/ui/tooltip'
import { CustomizeSidebarDialog } from './CustomizeSidebarDialog'
import { ChannelSidebarData } from 'src/types/ChannelGroup'

interface CustomizeSidebarButtonProps {
    data: ChannelSidebarData
    onSave?: (data: ChannelSidebarData) => void
}

export const CustomizeSidebarButton = ({ data, onSave }: CustomizeSidebarButtonProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mr-1"
                            aria-label="Customize sidebar"
                        >
                            <GripVertical className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5} className="text-[11px]">
                    <p>Customize sidebar</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-[960px] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                <CustomizeSidebarDialog
                    initialData={data}
                    onClose={() => setIsOpen(false)}
                    onSave={onSave}
                />
            </DialogContent>
        </Dialog>
    )
}

