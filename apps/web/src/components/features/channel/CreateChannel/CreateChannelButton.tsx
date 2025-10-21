import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
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
import { CreateChannelForm } from './CreateChannelForm'

export const CreateChannelButton = () => {
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
                            aria-label="Create a new channel"
                        >
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5} className="text-[11px]">
                    <p>Create a new channel</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-[680px] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                <CreateChannelForm onClose={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

