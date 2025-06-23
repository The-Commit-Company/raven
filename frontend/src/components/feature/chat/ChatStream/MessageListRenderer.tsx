// MessageItemRenderer.tsx - Optimized for better Virtuoso performance
import { DateSeparator } from '@/components/layout/Divider/DateSeparator'
import { memo, useMemo } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'
import { MessageItem } from '../ChatMessage/MessageItem'
import SystemMessageBlock from '../ChatMessage/SystemMessageBlock'

interface MessageItemRendererProps {
  message: any
  isHighlighted: boolean
  onReplyMessageClick: (messageID: string) => void
  setEditMessage: (message: Message) => void
  replyToMessage: (message: Message) => void
  setForwardMessage: (message: Message) => void
  showThreadButton: boolean
  setAttachDocument: (message: Message) => void
  setDeleteMessage: (message: Message) => void
  setReactionMessage: (message: Message) => void
  seenUsers: any
  channel: any
  isPending?: boolean
}

export const MessageItemRenderer = memo(
  ({
    message,
    isHighlighted,
    onReplyMessageClick,
    setEditMessage,
    replyToMessage,
    setForwardMessage,
    showThreadButton,
    setAttachDocument,
    setDeleteMessage,
    setReactionMessage,
    seenUsers,
    channel,
    isPending
  }: MessageItemRendererProps) => {
    // Memoize the message key for better performance
    const messageKey = useMemo(() => `${message.name}_${message.modified}`, [message.name, message.modified])

    // Memoize the message ID for DOM element
    const messageElementId = useMemo(() => `message-${message.name}`, [message.name])

    // Early return for date separators
    if (message.message_type === 'date') {
      const dateKey = `date-${message.creation}`
      return (
        <DateSeparator key={dateKey} id={dateKey} className='p-2 z-10 relative'>
          {message.creation}
        </DateSeparator>
      )
    }

    // Early return for system messages
    if (message.message_type === 'System') {
      return <SystemMessageBlock key={messageKey} message={message} />
    }

    // Main message component with optimized container
    return (
      <div key={messageKey} id={messageElementId} className='w-full overflow-x-clip overflow-y-visible text-ellipsis'>
        <MessageItem
          message={message}
          isHighlighted={isHighlighted}
          onReplyMessageClick={onReplyMessageClick}
          setEditMessage={setEditMessage}
          replyToMessage={replyToMessage}
          forwardMessage={setForwardMessage}
          showThreadButton={showThreadButton}
          onAttachDocument={setAttachDocument}
          setDeleteMessage={setDeleteMessage}
          setReactionMessage={setReactionMessage}
          seenUsers={seenUsers}
          channel={channel}
          isPending={isPending}
        />
      </div>
    )
  }
)
