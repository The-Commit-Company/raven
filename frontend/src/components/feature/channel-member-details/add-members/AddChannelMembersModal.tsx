import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Dialog } from '@radix-ui/themes'
import { useCallback } from 'react'
import { AddChannelMembersModalContent } from './AddChannelMemberModalContent'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'
import clsx from 'clsx'

type Props = {
    open: boolean,
    setOpen: (open: boolean) => void
}

const AddChannelMembersModal = ({
    open,
    setOpen,
}: Props) => {

    const onClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Content className={clsx(DIALOG_CONTENT_CLASS, 'static')}>
                    <AddChannelMembersModalContent
                        onClose={onClose}
                    />
                </Dialog.Content>
            </Dialog.Root>
        )
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <div className='pb-16 min-h-96 px-1 overflow-auto'>
                    <AddChannelMembersModalContent
                        onClose={onClose}
                    />
                </div>
            </DrawerContent>
        </Drawer>
    }



}

export default AddChannelMembersModal