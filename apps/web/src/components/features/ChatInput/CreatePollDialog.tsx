import { lazy, Suspense, useState } from 'react'
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
import { Spinner } from '@components/ui/spinner'
import _ from '@lib/translate'

// The poll form (date picker, selects, form-elements) is only needed once the dialog
// opens, so load it on demand rather than in the composer bundle.
const CreatePollForm = lazy(() => import('./CreatePollForm').then((m) => ({ default: m.CreatePollForm })))

interface CreatePollDialogProps {
    channelID: string
    /** Controlled open state — omit for the default self-managed icon-trigger mode. */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    /** Hide the built-in icon trigger when an external control (e.g. mobile sheet) opens this. */
    hideTrigger?: boolean
}

export const CreatePollDialog = ({ channelID, open, onOpenChange, hideTrigger }: CreatePollDialogProps) => {
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
            )}
            <DialogContent>
                <Suspense fallback={<div className="flex h-64 items-center justify-center"><Spinner /></div>}>
                    <CreatePollForm channelID={channelID} onClose={() => setOpen(false)} />
                </Suspense>
            </DialogContent>
        </Dialog>
    )
}

