import { DateSeparator } from '@/components/layout/Divider/DateSeparator'
import clsx from 'clsx'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
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
  onMessageVisible?: (messageName: string) => void
  scrollToMessage?: (messageID: string) => void
}

export const MessageListRenderer = ({
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
  channel,
  onMessageVisible
}: MessageListRendererProps) => {
  const intersectionObserver = useRef<IntersectionObserver | null>(null)
  const visibleMessages = useRef<Set<string>>(new Set())

  // Tạo Intersection Observer để theo dõi message nào đang hiển thị
  useEffect(() => {
    if (!onMessageVisible) return

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageName = entry.target.getAttribute('data-message-name')
          if (messageName) {
            if (entry.isIntersecting) {
              visibleMessages.current.add(messageName)
            } else {
              visibleMessages.current.delete(messageName)
            }
          }
        })

        // Tìm message ở giữa màn hình để lưu vị trí
        const centerMessage = findCenterMessage()
        if (centerMessage) {
          onMessageVisible(centerMessage)
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px', // Chỉ tính message ở 60% giữa màn hình
        threshold: 0.1
      }
    )

    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect()
      }
    }
  }, [onMessageVisible])

  // Tìm message ở giữa màn hình
  const findCenterMessage = useCallback(() => {
    const visibleArray = Array.from(visibleMessages.current)
    if (visibleArray.length === 0) return null

    // Trả về message gần giữa nhất
    const middleIndex = Math.floor(visibleArray.length / 2)
    return visibleArray[middleIndex]
  }, [])

  // Effect để observe các message elements
  useEffect(() => {
    if (!intersectionObserver.current) return

    const currentObserver = intersectionObserver.current

    // Observe tất cả message elements
    Object.values(messageRefs.current).forEach((element) => {
      if (element && element.getAttribute('data-message-name')) {
        currentObserver.observe(element)
      }
    })

    return () => {
      currentObserver.disconnect()
    }
  }, [messages, messageRefs])

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
              data-message-name={message.name}
              ref={(el) => {
                messageRefs.current[message.name] = el
                if (el) {
                  el.setAttribute('data-message-name', message.name)
                }
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
