import { useState } from 'react'
import { Button } from '@components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import _ from '@lib/translate'
import { FileBoxIcon } from 'lucide-react'

interface AttachFrappeDocumentDialogProps {
    /** Controlled open state — omit for the default self-managed icon-trigger mode. */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    /** Hide the built-in icon trigger when an external control (e.g. mobile sheet) opens this. */
    hideTrigger?: boolean
}

const AttachFrappeDocumentDialog = ({ open, onOpenChange, hideTrigger }: AttachFrappeDocumentDialogProps = {}) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = open ?? internalOpen
    const setOpen = onOpenChange ?? setInternalOpen

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {!hideTrigger && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                isIconButton
                                aria-label={_("Attach a document from the system")}
                            >
                                <FileBoxIcon />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        {_("Attach a document from the system")}
                    </TooltipContent>
                </Tooltip>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{_("Attach a document from the system")}</DialogTitle>
                    <DialogDescription>{_("Choose a document from the system to send with your message.")}</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default AttachFrappeDocumentDialog