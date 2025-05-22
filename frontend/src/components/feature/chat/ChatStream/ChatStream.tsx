import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { DateSeparator } from '@/components/layout/Divider/DateSeparator'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState/EmptyState'
import { useChannelSeenUsers } from '@/hooks/useChannelSeenUsers'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useUserData } from '@/hooks/useUserData'
import { Button } from '@radix-ui/themes'
import clsx from 'clsx'
import { forwardRef, MutableRefObject, useEffect, useImperativeHandle } from 'react'
import { FiArrowDown } from 'react-icons/fi'
import { useInView } from 'react-intersection-observer'
import { Message } from '../../../../../../types/Messaging/Message'
import AttachFileToDocumentDialog, { useAttachFileToDocument } from '../ChatMessage/MessageActions/AttachFileToDocument'
import { DeleteMessageDialog, useDeleteMessage } from '../ChatMessage/MessageActions/DeleteMessage'
import { EditMessageDialog, useEditMessage } from '../ChatMessage/MessageActions/EditMessage'
import { ForwardMessageDialog, useForwardMessage } from '../ChatMessage/MessageActions/ForwardMessage'
import {
  ReactionAnalyticsDialog,
  useMessageReactionAnalytics
} from '../ChatMessage/MessageActions/MessageReactionAnalytics'
import { MessageItem } from '../ChatMessage/MessageItem'
import SystemMessageBlock from '../ChatMessage/SystemMessageBlock'
import ChatStreamLoader from './ChatStreamLoader'
import useChatStream from './useChatStream'

type Props = {
  channelID: string
  replyToMessage: (message: Message) => void
  showThreadButton?: boolean
  scrollRef: MutableRefObject<HTMLDivElement | null>
  pinnedMessagesString?: string
  onModalClose?: () => void
}
// Component hiển thị stream tin nhắn trong kênh.
const ChatStream = forwardRef(
  (
    { channelID, replyToMessage, showThreadButton = true, pinnedMessagesString, scrollRef, onModalClose }: Props,
    ref
  ) => {
    const {
      messages,
      hasOlderMessages,
      loadOlderMessages,
      goToLatestMessages,
      hasNewMessages,
      error,
      loadNewerMessages,
      isLoading,
      highlightedMessage,
      scrollToMessage,
      newMessageCount,
      messageRefs,
      showScrollToBottomButton
    } = useChatStream(channelID, scrollRef, pinnedMessagesString)
    // Hook quản lý việc xóa tin nhắn, truyền thêm onModalClose để đóng dialog khi xong
    const { setDeleteMessage, ...deleteProps } = useDeleteMessage(onModalClose)
    // Hook quản lý việc chỉnh sửa tin nhắn
    const { setEditMessage, ...editProps } = useEditMessage(onModalClose)
    // Hook quản lý việc chia sẻ tin nhắn
    const { setForwardMessage, ...forwardProps } = useForwardMessage(onModalClose)
    // Hook quản lý việc gán file vào tin nhắn
    const { setAttachDocument, ...attachDocProps } = useAttachFileToDocument(onModalClose)
    // Hook quản lý việc thống kê phản hồi tin nhắn
    const { setReactionMessage, ...reactionProps } = useMessageReactionAnalytics(onModalClose)

    const onReplyMessageClick = (messageID: string) => {
      scrollToMessage(messageID)
    }
    // Lấy thông tin user hiện tại (đặc biệt là name để xác định user trong danh sách thành viên)
    const { name: userID } = useUserData()

    // Khi người dùng nhấn phím mũi tên lên, chúng ta cần kiểm tra xem tin nhắn cuối cùng có phải là tin nhắn được gửi bởi người dùng và là tin nhắn văn bản (không phải hệ thống hoặc file)
    // Nếu có, chúng ta cần mở modal chỉnh sửa tin nhắn
    // Hàm này cần được gọi từ component cha
    useImperativeHandle(ref, () => ({
      onUpArrow: () => {
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.message_type === 'Text' && lastMessage.owner === userID && !lastMessage.is_bot_message) {
            setEditMessage(lastMessage)
          }
        }
      }
    }))

    // Hook để theo dõi khi người dùng scroll đến cuối tin nhắn
    const { ref: oldLoaderRef } = useInView({
      fallbackInView: true,
      initialInView: false,
      skip: !hasOlderMessages,
      onChange: async (inView) => {
        if (inView && hasOlderMessages) {
          await loadOlderMessages()
        }
      }
    })

    // Hook để theo dõi khi người dùng scroll đến đầu tin nhắn
    const { ref: newLoaderRef } = useInView({
      fallbackInView: true,
      skip: !hasNewMessages,
      initialInView: false,
      onChange: (inView) => {
        if (inView && hasNewMessages) {
          loadNewerMessages()
        }
      }
    })

    // Hook để theo dõi khi người dùng resize window
    useEffect(() => {
      if (!scrollRef.current) return

      const observer = new ResizeObserver(() => {
        const scrollContainer = scrollRef.current
        if (!scrollContainer) return

        // Kiểm tra xem có đang ở gần cuối không trước khi điều chỉnh cuộn
        // (scrollTop + clientHeight >= scrollHeight - 100px)
        if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100) {
          requestAnimationFrame(() => {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'instant'
            })
          })
        }
      })

      observer.observe(scrollRef.current)

      return () => {
        observer.disconnect()
      }
    }, []) // Only run once on mount since we're just observing the container

    const { seenUsers } = useChannelSeenUsers(channelID)

    const { channel } = useCurrentChannelData(channelID)

    return (
      <div className='relative h-full flex flex-col overflow-y-auto pb-16 sm:pb-0' ref={scrollRef}>
        <div ref={oldLoaderRef}>
          {hasOlderMessages && !isLoading && (
            <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
              <Loader />
            </div>
          )}
        </div>
        {/* Hiển thị thông báo nếu không có tin nhắn cũ và không đang tải (đầu lịch sử chat) */}
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}
        {/* Hiển thị loader khi đang tải tin nhắn */}
        {isLoading && <ChatStreamLoader />}
        {/* Hiển thị thông báo lỗi nếu có */}
        {error && <ErrorBanner error={error} />}
        {/* Hiển thị tin nhắn */}
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
        {/* Hiển thị loader khi có tin nhắn mới */}
        {hasNewMessages && (
          <div ref={newLoaderRef}>
            <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
              <Loader />
            </div>
          </div>
        )}

        {/* Hiển thị nút scroll đến tin nhắn mới */}
        {hasNewMessages && newMessageCount > 0 && (
          <div className='fixed bottom-40 z-50 right-10 cursor-pointer'>
            <Button className='shadow-lg' onClick={goToLatestMessages}>
              {`${newMessageCount} tin nhắn mới`}
              <FiArrowDown size={18} />
            </Button>
          </div>
        )}
        {!hasNewMessages && showScrollToBottomButton && (
          <div className='fixed bottom-40 z-50 right-10 cursor-pointer'>
            <Button className='shadow-lg' onClick={goToLatestMessages}>
              <FiArrowDown size={18} />
            </Button>
          </div>
        )}
        {/* Hiển thị dialog xóa tin nhắn */}
        <DeleteMessageDialog {...deleteProps} />
        {/* Hiển thị dialog chỉnh sửa tin nhắn */}
        <EditMessageDialog {...editProps} />
        {/* Hiển thị dialog chia sẻ tin nhắn */}
        <ForwardMessageDialog {...forwardProps} />
        {/* Hiển thị dialog gán file vào tin nhắn */}
        <AttachFileToDocumentDialog {...attachDocProps} />
        {/* Hiển thị dialog thống kê phản hồi tin nhắn */}
        <ReactionAnalyticsDialog {...reactionProps} />
      </div>
    )
  }
)

export default ChatStream
