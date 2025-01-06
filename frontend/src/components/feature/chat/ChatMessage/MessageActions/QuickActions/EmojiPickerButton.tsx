import { lazy, Suspense } from 'react'
import { Box, Flex, IconButton, IconButtonProps, Popover, Portal, Tooltip } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Loader } from '@/components/common/Loader'
import { QUICK_ACTION_BUTTON_CLASS } from './QuickActionButton'
import { LuSmilePlus } from 'react-icons/lu'
import clsx from 'clsx'

const EmojiPicker = lazy(() => import('@/components/common/EmojiPicker/EmojiPicker'))

interface EmojiPickerButtonProps {
    saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void,
    isOpen: boolean
    setIsOpen: (open: boolean) => void,
    iconButtonProps?: IconButtonProps,
    iconSize?: string
}

export const EmojiPickerButton = ({ saveReaction, isOpen, setIsOpen, iconButtonProps, iconSize = '18' }: EmojiPickerButtonProps) => {

    const onClose = () => {
        setIsOpen(false)
    }

    const onEmojiClick = (emoji: string, is_custom: boolean, emoji_name?: string) => {
        saveReaction(emoji, is_custom, emoji_name)
        onClose()
    }

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Flex>
                <Tooltip content='Add reaction'>
                    <Popover.Trigger>
                        <IconButton
                            variant='soft'
                            size='2'
                            color='gray'
                            aria-label='pick emoji'
                            {...iconButtonProps}
                            className={clsx(QUICK_ACTION_BUTTON_CLASS, iconButtonProps?.className)}>
                            <LuSmilePlus size={iconSize} />
                        </IconButton>
                    </Popover.Trigger>
                </Tooltip>
                <Portal>
                    <Box className={'z-10'}>
                        <Popover.Content className={`${DIALOG_CONTENT_CLASS} p-0`}>
                            <Suspense fallback={<Loader />}>
                                <EmojiPicker onSelect={onEmojiClick} />
                            </Suspense>
                        </Popover.Content>
                    </Box>
                </Portal>
            </Flex>
        </Popover.Root>
    )
}