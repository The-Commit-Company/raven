import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Button, Dialog } from '@radix-ui/themes'
import { EditChannelDescriptionModalContent } from './EditChannelDescriptionModal'
import { useState } from 'react'
import { ButtonProps } from '@radix-ui/themes/dist/cjs/components/button'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/layout/Drawer'

interface EditDescriptionButtonProps extends ButtonProps {
    channelData: ChannelListItem,
    is_in_box?: boolean
}

export const EditDescriptionButton = ({ channelData, is_in_box }: EditDescriptionButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const button_text = channelData && channelData.channel_description && channelData.channel_description.length > 0 ? 'Edit' : 'Add'

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger>
                    <Button variant='ghost' size='1'>
                        {button_text} {is_in_box ? '' : 'description'}
                    </Button>
                </Dialog.Trigger>
                <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                    <EditChannelDescriptionModalContent
                        channelData={channelData}
                        onClose={onClose} />
                </Dialog.Content>
            </Dialog.Root>
        )
    } else {
        return <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant='ghost' size='1'>
                    {button_text} {is_in_box ? '' : 'description'}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className='pb-16 min-h-48 px-1 overflow-auto'>
                    <EditChannelDescriptionModalContent
                        channelData={channelData}
                        onClose={onClose} />
                </div>
            </DrawerContent>
        </Drawer>
    }


}