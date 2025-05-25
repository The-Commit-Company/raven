import { Loader } from '@/components/common/Loader'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { Box, Flex, IconButtonProps, Popover, Portal, Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import { lazy, Suspense } from 'react'
import { LuSmilePlus } from 'react-icons/lu'
import { QUICK_ACTION_BUTTON_CLASS } from './QuickActionButton'

const EmojiPicker = lazy(() => import('@/components/common/EmojiPicker/EmojiPicker'))

interface EmojiPickerButtonProps {
  saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  iconButtonProps?: IconButtonProps
  iconSize?: string
}

export const EmojiPickerButton = ({
  saveReaction,
  isOpen,
  setIsOpen,
  iconButtonProps,
  iconSize = '18'
}: EmojiPickerButtonProps) => {
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
            <button
              aria-label='pick emoji'
              {...iconButtonProps}
              className={clsx(
                'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
                'text-gray-12 hover:bg-atom-3 hover:border-atom-5',
                'dark:text-gray-12 dark:hover:bg-atom-4 dark:hover:border-atom-5',
                QUICK_ACTION_BUTTON_CLASS,
                iconButtonProps?.className
              )}
            >
              <LuSmilePlus size={iconSize} />
            </button>
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
