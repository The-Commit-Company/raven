import { useState } from 'react'
import { BsEmojiSmile } from 'react-icons/bs'
import { EmojiPicker } from '../../common/EmojiPicker/EmojiPicker'
import { useModalContentStyle } from '@/hooks/useModalContentStyle'
import { Box, Flex, IconButton, Popover, Portal, Tooltip } from '@radix-ui/themes'

interface EmojiPickerButtonProps {
    saveReaction: (emoji: string) => void
}

export const EmojiPickerButton = ({ saveReaction }: EmojiPickerButtonProps) => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

    const contentClass = useModalContentStyle()

    const onEmojiClick = (emoji: string) => {
        saveReaction(emoji)
        onClose()
    }

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Flex>
                <Tooltip content='find another reaction'>
                    <Popover.Trigger>
                        <IconButton
                            variant='soft'
                            size='1'
                            color='gray'
                            aria-label='pick emoji'>
                            <BsEmojiSmile fontSize={'0.8rem'} />
                        </IconButton>
                    </Popover.Trigger>
                </Tooltip>
                <Portal>
                    <Box className={'z-10'}>
                        <Popover.Content className={`${contentClass} p-0`}>
                            <EmojiPicker onSelect={onEmojiClick} />
                        </Popover.Content>
                    </Box>
                </Portal>
            </Flex>
        </Popover.Root>
    )
}