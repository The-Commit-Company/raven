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
import _ from '@lib/translate'

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
                            aria-label={_("Create a poll")}
                        >
                            <BarChart3 />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                    {_("Create a poll")}
                </TooltipContent>
            </Tooltip>
            <DialogContent className="">
                <CreatePollForm channelID={channelID} onClose={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

