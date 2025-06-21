import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import usePostMessageReaction from '@/hooks/usePostMessageReaction'
import { UserContext } from '@/utils/auth/UserProvider'
import { QuickEmojisAtom } from '@/utils/preferences'
import { Box, Flex } from '@radix-ui/themes'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { MouseEventHandler, useContext, useRef } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { BiDotsHorizontalRounded } from 'react-icons/bi'
import { LuReply } from 'react-icons/lu'
import { toast } from 'sonner'
import { MessageContextMenuProps } from '../MessageActions'
import { CreateThreadActionButton } from './CreateThreadButton'
import { EmojiPickerButton } from './EmojiPickerButton'
import { QUICK_ACTION_BUTTON_CLASS, QuickActionButton } from './QuickActionButton'

interface QuickActionsProps extends MessageContextMenuProps {
  isEmojiPickerOpen: boolean
  setIsEmojiPickerOpen: (open: boolean) => void
  alignToRight?: boolean
}

export const QuickActions = ({
  message,
  onReply,
  onEdit,
  isEmojiPickerOpen,
  setIsEmojiPickerOpen,
  showThreadButton = true,
  alignToRight = false
}: QuickActionsProps) => {
  const { currentUser } = useContext(UserContext)

  const quickEmojis = useAtomValue(QuickEmojisAtom)

  const isOwner = currentUser === message?.owner && !message?.is_bot_message
  const toolbarRef = useRef<HTMLDivElement>(null)

  /**
   * When the user clicks on the more button, we want to trigger a right click event
   * so that we open the context menu instead of duplicating the actions in a dropdown menu
   * @param e - MouseEvent
   */
  const onMoreClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()

    const evt = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: e.clientX,
      clientY: e.clientY,
      screenX: e.screenX,
      screenY: e.screenY,
      buttons: 2
    })
    e.target.dispatchEvent(evt)
  }

  const postReaction = usePostMessageReaction()

  const onEmojiReact = (emoji: string, is_custom: boolean = false, emoji_name?: string) => {
    if (message) {
      postReaction(message, emoji, is_custom, emoji_name).catch((err) => {
        toast.error('Could not react to message.', {
          description: getErrorMessage(err)
        })
      })
    }
  }

  // @ts-ignore
  const CHAT_STYLE = window.frappe?.boot?.chat_style ?? 'Simple'

  return (
    <Box
      ref={toolbarRef}
      className={clsx(
        'absolute group-hover:visible group-hover:transition-all ease-ease-out-quad group-hover:delay-100 z-50 p-1 shadow-md rounded-md bg-white dark:bg-gray-1 invisible',
        CHAT_STYLE === 'Left-Right' ? (alignToRight ? '-top-10 right-0' : '-top-10 left-0') : '-top-6 right-4'
      )}
    >
      <Flex gap='1'>
        {quickEmojis?.map((emoji) => {
          return (
            <QuickActionButton
              key={emoji}
              className={'text-base'}
              tooltip={`React with ${emoji}`}
              aria-label={`React with ${emoji}`}
              onClick={() => {
                onEmojiReact(emoji)
              }}
            >
              {emoji}
            </QuickActionButton>
          )
        })}

        <EmojiPickerButton isOpen={isEmojiPickerOpen} setIsOpen={setIsEmojiPickerOpen} saveReaction={onEmojiReact} />

        {isOwner && message.message_type === 'Text' ? (
          <QuickActionButton onClick={onEdit} tooltip='Edit message' aria-label='Edit message'>
            <AiOutlineEdit size='18' />
          </QuickActionButton>
        ) : (
          <QuickActionButton tooltip='Reply' aria-label='Reply to this message' onClick={onReply}>
            <LuReply size='18' />
          </QuickActionButton>
        )}

        {message && !message.is_thread && showThreadButton && <CreateThreadActionButton messageID={message.name} />}

        <QuickActionButton
          aria-label='More actions'
          variant='soft'
          tooltip='More actions'
          onClick={onMoreClick}
          className={QUICK_ACTION_BUTTON_CLASS}
        >
          <BiDotsHorizontalRounded size='18' />
        </QuickActionButton>
      </Flex>
    </Box>
  )
}
