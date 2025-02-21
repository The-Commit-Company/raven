import { Dialog } from '@radix-ui/themes'
import { useCallback } from 'react'
import { AddChannelMembersModalContent } from './AddChannelMemberModalContent'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'

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
                {/* The backdrop is removed in this case because we don't want the backdrop blur to appear in front of the dropdown contents */}
                <Dialog.Content className='static'>
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