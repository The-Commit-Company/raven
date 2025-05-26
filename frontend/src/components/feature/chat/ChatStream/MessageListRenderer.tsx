// MessageItemRenderer.tsx - Component render từng tin nhắn trong Virtuoso
import { DateSeparator } from '@/components/layout/Divider/DateSeparator'
import { memo } from 'react'
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
    channel
  }: MessageItemRendererProps) => {
    // Hiển thị separator ngày
    if (message.message_type === 'date') {
      return (
        <DateSeparator key={`date-${message.creation}`} id={`date-${message.creation}`} className='p-2 z-10 relative'>
          {message.creation}
        </DateSeparator>
      )
    }

    // Hiển thị thông báo hệ thống
    if (message.message_type === 'System') {
      return <SystemMessageBlock key={`${message.name}_${message.modified}`} message={message} />
    }

    // Hiển thị tin nhắn thông thường
    return (
      <div
        key={`${message.name}_${message.modified}`}
        id={`message-${message.name}`}
        className='w-full overflow-x-clip overflow-y-visible text-ellipsis'
      >
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
        />
      </div>
    )
  }
)
