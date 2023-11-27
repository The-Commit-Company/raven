import { RenameChannelModalContent } from '@/components/feature/channel-details/rename-channel/ChannelRenameModal'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Dialog, IconButton } from '@radix-ui/themes'
import { BiEdit } from 'react-icons/bi'
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'
import { useState } from "react"
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'

interface EditChannelNameButtonProps extends IconButtonProps {
    channelID: string,
    channel_name: string,
    channelType: ChannelListItem['type']
}

export const EditChannelNameButton = ({ channelID, channel_name, channelType, ...props }: EditChannelNameButtonProps) => {

    const [open, setOpen] = useState(false);

    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <IconButton
                    variant="ghost"
                    color="gray"
                    aria-label="Click to edit channel name"
                    title='Edit channel name'
                    {...props}>
                    <BiEdit size='16' />
                </IconButton>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <RenameChannelModalContent
                    channelID={channelID}
                    channelName={channel_name}
                    onClose={onClose}
                    type={channelType} />
            </Dialog.Content>
        </Dialog.Root>
    )
}