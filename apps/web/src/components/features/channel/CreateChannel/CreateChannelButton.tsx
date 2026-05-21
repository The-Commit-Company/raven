import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
} from '@components/ui/drawer'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@components/ui/tooltip'
import { CreateChannelForm } from './CreateChannelForm'
import { useIsMobile } from '@hooks/use-mobile'
import _ from '@lib/translate'

export const CreateChannelButton = () => {
    const [isOpen, setIsOpen] = useState(false)
    const isMobile = useIsMobile()

    const form = <CreateChannelForm onClose={() => setIsOpen(false)} />

    return (
        <>
            {isMobile ? (
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerContent className="h-[90vh] flex flex-col overflow-hidden">
                        <DrawerTitle className="sr-only">{_('Create a new channel')}</DrawerTitle>
                        {form}
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-170 max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                        <DialogTitle className="sr-only">{_('Create a new channel')}</DialogTitle>
                        {form}
                    </DialogContent>
                </Dialog>
            )}

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        className="h-6 w-6"
                        aria-label={_('Create a new channel')}
                        onClick={() => setIsOpen(true)}
                    >
                        <PlusIcon className="h-3 w-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5} className="text-2xs">
                    <p>{_('Create a new channel')}</p>
                </TooltipContent>
            </Tooltip>
        </>
    )
}
