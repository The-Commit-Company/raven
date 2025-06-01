// 3. MessageListRenderer.tsx - Component render danh sách tin nhắn
import { DateSeparator } from '@/components/layout/Divider/DateSeparator'
import clsx from 'clsx'
import { memo, MutableRefObject } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'
import { MessageItem } from '../ChatMessage/MessageItem'
import SystemMessageBlock from '../ChatMessage/SystemMessageBlock'

interface MessageListRendererProps {
  messages: any[]
  isLoading: boolean
  highlightedMessage: string | null
  messageRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
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

const MessageListRenderer = ({
  messages,
  isLoading,
  highlightedMessage,
  messageRefs,
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
}: MessageListRendererProps) => {
  return (
    <div
      className={clsx(
        'flex flex-col pb-4 z-50 transition-opacity duration-400 ease-ease-out-cubic',
        isLoading ? 'opacity-0' : 'opacity-100'
      )}
    >
      {messages?.map((message) => {
        // Hiển thị separator ngày
        if (message.message_type === 'date') {
          return (
            <DateSeparator
              key={`date-${message.creation}`}
              id={`date-${message.creation}`}
              className='p-2 z-10 relative'
            >
              {message.creation}
            </DateSeparator>
          )
        }
        // Hiển thị thông báo hệ thống
        else if (message.message_type === 'System') {
          return <SystemMessageBlock key={`${message.name}_${message.modified}`} message={message} />
        }
        // Hiển thị tin nhắn thông thường
        else {
          return (
            <div
              key={`${message.name}_${message.modified}`}
              id={`message-${message.name}`}
              ref={(el) => {
                messageRefs.current[message.name] = el
              }}
            >
              <div className='w-full overflow-x-clip overflow-y-visible text-ellipsis'>
                <MessageItem
                  message={message}
                  isHighlighted={highlightedMessage === message.name}
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
            </div>
          )
        }
      })}
    </div>
  )
}

export default memo(MessageListRenderer)
