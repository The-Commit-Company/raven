import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { ChangeChannelTypeModal } from './ChangeChannelTypeModal'
import { useState } from 'react'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'
import { Button, Dialog } from '@radix-ui/themes'
interface ChangeChannelTypeButtonProps {
    channelData: ChannelListItem
}

export const ChangeChannelTypeButton = ({ channelData }: ChangeChannelTypeButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button color='gray' variant='surface'>
                    {channelData.type === 'Public' ? <BiLockAlt /> : <BiHash />}
                    Change to a {channelData.type === 'Public' ? 'private' : 'public'} channel
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={contentClass}>
                <ChangeChannelTypeModal
                    onClose={onClose}
                    channelData={channelData} />
            </Dialog.Content>
        </Dialog.Root>
    )
}