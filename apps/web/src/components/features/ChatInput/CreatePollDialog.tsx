import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
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
import { CreatePollForm } from './CreatePollForm'

interface CreatePollDialogProps {
    channelID: string
}

export const CreatePollDialog = ({ channelID }: CreatePollDialogProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            isIconButton
                            className="h-8 w-8"
                            aria-label="Create a poll"
                        >
                            <BarChart3 className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5} className="text-2xs">
                    <p>Create a poll</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-200 h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>button]:top-5 [&>button]:right-4">
                <CreatePollForm channelID={channelID} onClose={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

