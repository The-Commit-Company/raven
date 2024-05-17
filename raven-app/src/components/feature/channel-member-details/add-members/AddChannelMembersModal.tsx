import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Dialog } from '@radix-ui/themes'
import { useCallback } from 'react'
import { AddChannelMembersModalContent } from './AddChannelMemberModalContent'

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


    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <AddChannelMembersModalContent
                    onClose={onClose}
                />
            </Dialog.Content>
        </Dialog.Root>
    )
}

export default AddChannelMembersModal