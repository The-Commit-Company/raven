import { ModalTypes, useModalManager } from "@/hooks/useModalManager"
import { ChannelRenameModal } from '@/components/feature/channel-details/rename-channel/ChannelRenameModal'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button, Dialog, IconButton, Theme, ThemePanel, Tooltip } from '@radix-ui/themes'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'

interface EditChannelNameButtonProps extends IconButtonProps {
    channelID: string,
    channel_name: string,
    channelType: ChannelListItem['type']
}

export const EditChannelNameButton = ({ channelID, channel_name, channelType, ...props }: EditChannelNameButtonProps) => {

    const modalManager = useModalManager()
    const onRenameChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.RenameChannel)
    }

    return (
        <>
            <Tooltip content="Edit channel name">
                <IconButton
                    variant="ghost"
                    onClick={onRenameChannelModalOpen}
                    aria-label="edit-channel-name"
                    {...props}>
                    <Pencil2Icon />
                </IconButton>
            </Tooltip>
            <ChannelRenameModal
                isOpen={modalManager.modalType === ModalTypes.RenameChannel}
                onClose={modalManager.closeModal}
                channelID={channelID}
                channel_name={channel_name}
                type={channelType} />
            <Dialog.Root>
                <Dialog.Trigger><Button>Open</Button></Dialog.Trigger>
                <Dialog.Content>
                    <Dialog.Title>My Dialog</Dialog.Title>
                    <Dialog.Description>A sample dialog</Dialog.Description>
                    <Dialog.Close>
                        <Button>Close</Button>
                    </Dialog.Close>
                </Dialog.Content>

            </Dialog.Root>
        </>
    )
}