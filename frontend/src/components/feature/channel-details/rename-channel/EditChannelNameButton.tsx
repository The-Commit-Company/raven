import { RenameChannelModalContent } from '@/components/feature/channel-details/rename-channel/ChannelRenameModal'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Dialog, IconButton } from '@radix-ui/themes'
import { AiOutlineEdit } from 'react-icons/ai'
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'
import { useState } from "react"
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { DrawerContent, DrawerTrigger, Drawer } from '@/components/layout/Drawer'
import clsx from 'clsx'

interface EditChannelNameButtonProps extends IconButtonProps {
    channelID: string,
    channel_name: string,
    channelType: ChannelListItem['type'],
    buttonVisible?: boolean,
}

export const EditChannelNameButton = ({ channelID, channel_name, channelType, buttonVisible = false, ...props }: EditChannelNameButtonProps) => {

    const [open, setOpen] = useState(false);

    const onClose = () => {
        setOpen(false)
    }

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                    <IconButton
                        variant="ghost"
                        color="gray"
                        className={clsx(buttonVisible ? '' : 'invisible group-hover:visible')}
                        aria-label="Click to edit channel name"
                        title='Edit channel name'
                        {...props}>
                        <AiOutlineEdit size='14' />
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
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <IconButton
                    variant="ghost"
                    color="gray"
                    className={clsx(buttonVisible ? '' : 'invisible group-hover:visible')}
                    aria-label="Click to edit channel name"
                    title='Edit channel name'
                    {...props}>
                    <AiOutlineEdit size='14' />
                </IconButton>
            </DrawerTrigger>
            <DrawerContent>
                <div className='pb-16 min-h-48 px-1 overflow-auto'>
                    <RenameChannelModalContent
                        channelID={channelID}
                        channelName={channel_name}
                        onClose={onClose}
                        type={channelType} />
                </div>
            </DrawerContent>
        </Drawer>
    }


}