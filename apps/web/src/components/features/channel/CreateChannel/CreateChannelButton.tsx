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
import { CreateChannelForm } from './CreateChannelForm'
import { useIsMobile } from '@hooks/use-mobile'
import _ from '@lib/translate'

/**
 * Controlled create-channel surface (dialog on desktop, drawer on mobile).
 * Opened from the sidebar's ellipsis menu — there is no standalone button.
 */
export const CreateChannelDialog = ({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) => {
    const isMobile = useIsMobile()

    const form = <CreateChannelForm onClose={() => onOpenChange(false)} />

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[90vh] flex flex-col overflow-hidden">
                    <DrawerTitle className="sr-only">{_('Create a new channel')}</DrawerTitle>
                    {form}
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-170 max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
                <DialogTitle className="sr-only">{_('Create a new channel')}</DialogTitle>
                {form}
            </DialogContent>
        </Dialog>
    )
}
