import { useState } from 'react'
import { EmojiPicker } from '../../common/EmojiPicker/EmojiPicker'
import { Box, Flex, IconButton, Popover, Portal, Tooltip } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Smile } from 'lucide-react'

interface EmojiPickerButtonProps {
    saveReaction: (emoji: string) => void
}

export const EmojiPickerButton = ({ saveReaction }: EmojiPickerButtonProps) => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

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
                            <Smile size='14' />
                        </IconButton>
                    </Popover.Trigger>
                </Tooltip>
                <Portal>
                    <Box className={'z-10'}>
                        <Popover.Content className={`${DIALOG_CONTENT_CLASS} p-0`}>
                            <EmojiPicker onSelect={onEmojiClick} />
                        </Popover.Content>
                    </Box>
                </Portal>
            </Flex>
        </Popover.Root>
    )
}