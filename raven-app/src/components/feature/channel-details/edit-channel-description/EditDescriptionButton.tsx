import { Button, ButtonProps } from '@chakra-ui/react'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Dialog } from '@radix-ui/themes'
import { EditChannelDescriptionModalContent } from './EditChannelDescriptionModal'
import { useState } from 'react'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'

interface EditDescriptionButtonProps extends ButtonProps {
    channelData: ChannelListItem,
    is_in_box?: boolean
}

export const EditDescriptionButton = ({ channelData, is_in_box, ...props }: EditDescriptionButtonProps) => {

    const [open, setOpen] = useState(false)
    const onClose = () => {
        setOpen(false)
    }
    const contentClass = useModalContentStyle()
    const button_text = channelData && channelData.channel_description && channelData.channel_description.length > 0 ? 'Edit' : 'Add'

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button colorScheme='blue' variant='link' size='sm' {...props}>
                    {button_text} {is_in_box ? '' : 'description'}
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={contentClass}>
                <EditChannelDescriptionModalContent
                    channelData={channelData}
                    onClose={onClose} />
            </Dialog.Content>
        </Dialog.Root>
    )
}