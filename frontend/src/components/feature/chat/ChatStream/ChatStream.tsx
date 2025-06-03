// ChatStream.tsx - Fixed version
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState/EmptyState'
import { useChannelSeenUsers } from '@/hooks/useChannelSeenUsers'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useUserData } from '@/hooks/useUserData'
import {
  forwardRef,
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import { useLocation } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { Message } from '../../../../../../types/Messaging/Message'
import ChatDialogs from './ChatDialogs'
import ChatStreamLoader from './ChatStreamLoader'
import { MessageItemRenderer } from './MessageListRenderer'
import ScrollToBottomButtons from './ScrollToBottomButtons'
import useChatStream from './useChatStream'
import { useChatStreamActions } from './useChatStreamActions'

type Props = {
  channelID: string
  replyToMessage: (message: Message) => void
  showThreadButton?: boolean
  pinnedMessagesString?: string
  onModalClose?: () => void
  virtuosoRef: MutableRefObject<VirtuosoHandle>
}

const ChatStream = forwardRef<VirtuosoHandle, Props>(
  ({ channelID, replyToMessage, showThreadButton = true, pinnedMessagesString, onModalClose, virtuosoRef }, ref) => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const isSavedMessage = searchParams.has('message_id')
    const messageId = searchParams.get('message_id')
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(false)
    const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const lastScrollTopRef = useRef(0)
    const hasInitialLoadedWithMessageId = useRef(false)

    //reset state khi channelID hoặc messageId thay đổi
    useEffect(() => {
      setIsInitialLoadComplete(false)
      setHasScrolledToTarget(false)
      setIsLoadingMessages(false)
      lastScrollTopRef.current = 0
      // Reset flag khi thay đổi channel hoặc message_id
      hasInitialLoadedWithMessageId.current = false
    }, [channelID, messageId])

    // FIX: Đánh dấu đã initial load với message_id để tránh auto-load ngay lập tức
    useEffect(() => {
      if (messageId && isInitialLoadComplete && !hasInitialLoadedWithMessageId.current) {
        hasInitialLoadedWithMessageId.current = true
        // Cho một khoảng thời gian ngắn để tránh auto-load ngay sau khi mount
        setTimeout(() => {
          hasInitialLoadedWithMessageId.current = false
        }, 2000) // 2 giây đủ để tránh auto-load không mong muốn
      }
    }, [messageId, isInitialLoadComplete])

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
      newMessageIds,
      markMessageAsSeen,
      clearAllNewMessages
    } = useChatStream(channelID, virtuosoRef, pinnedMessagesString, isAtBottom)

    //Sau khi load được danh sách tin nhắn ban đầu, đánh dấu isInitialLoadComplete = true.
    useEffect(() => {
      if (messages && messages.length > 0 && !isInitialLoadComplete) {
        setTimeout(() => {
          setIsInitialLoadComplete(true)
        }, 100)
      }
    }, [messages, isInitialLoadComplete])

    const { deleteActions, editActions, forwardActions, attachDocActions, reactionActions } =
      useChatStreamActions(onModalClose)

    const { name: userID } = useUserData()
    const { seenUsers } = useChannelSeenUsers(channelID)
    const { channel } = useCurrentChannelData(channelID)

    const onReplyMessageClick = (messageID: string) => {
      scrollToMessage(messageID)
    }

    //tìm index của message được chỉ định qua message_id
    const targetIndex = useMemo(() => {
      if (!messageId || !messages) return undefined
      return messages.findIndex((msg) => msg.name === messageId)
    }, [messageId, messages])

    //Tự động scroll đến tin nhắn cần tìm khi đã load xong tin nhắn ban đầu, chưa scroll thủ công và chưa scroll đến trước đó.
    useEffect(() => {
      if (
        isInitialLoadComplete &&
        messageId &&
        messages &&
        targetIndex !== undefined &&
        targetIndex >= 0 &&
        !hasScrolledToTarget &&
        !isLoadingMessages &&
        virtuosoRef.current
      ) {
        setTimeout(() => {
          if (virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
              index: targetIndex,
              behavior: 'auto',
              align: 'center'
            })
            setHasScrolledToTarget(true)
          }
        }, 200)
      }
    }, [isInitialLoadComplete, messageId, messages, targetIndex, hasScrolledToTarget, isLoadingMessages, virtuosoRef])

    //Nếu thay đổi messageId, tự động scroll lại để đảm bảo đúng vị trí.
    useEffect(() => {
      if (messageId && messages && isInitialLoadComplete && !isLoadingMessages) {
        const newTargetIndex = messages.findIndex((msg) => msg.name === messageId)
        if (newTargetIndex >= 0 && virtuosoRef.current) {
          setHasScrolledToTarget(false)

          setTimeout(() => {
            if (virtuosoRef.current) {
              virtuosoRef.current.scrollToIndex({
                index: newTargetIndex,
                behavior: 'auto',
                align: 'center'
              })
              setHasScrolledToTarget(true)
            }
          }, 100)
        }
      }
    }, [messageId])

    //Tạo phương thức onUpArrow để chỉnh sửa tin nhắn cuối cùng do chính mình gửi khi bấm phím.
    useImperativeHandle(ref, () => {
      if (!virtuosoRef.current) {
        return {} as VirtuosoHandle
      }

      const handle = {
        ...virtuosoRef.current,
        onUpArrow: () => {
          if (messages?.length) {
            const lastMessage = messages[messages.length - 1]
            if (lastMessage.message_type === 'Text' && lastMessage.owner === userID && !lastMessage.is_bot_message) {
              editActions.setEditMessage(lastMessage)
            }
          }
        }
      }

      return handle
    }, [messages, userID, editActions.setEditMessage])

    const itemRenderer = useCallback(
      (index: number) => {
        if (!messages || !messages[index]) return null
        const message = messages[index]
        return (
          <MessageItemRenderer
            message={message}
            isHighlighted={highlightedMessage === message?.name}
            onReplyMessageClick={onReplyMessageClick}
            setEditMessage={editActions.setEditMessage}
            replyToMessage={replyToMessage}
            setForwardMessage={forwardActions.setForwardMessage}
            showThreadButton={showThreadButton}
            setAttachDocument={attachDocActions.setAttachDocument}
            setDeleteMessage={deleteActions.setDeleteMessage}
            setReactionMessage={reactionActions.setReactionMessage}
            seenUsers={seenUsers}
            channel={channel}
          />
        )
      },
      [
        messages,
        highlightedMessage,
        onReplyMessageClick,
        editActions.setEditMessage,
        replyToMessage,
        forwardActions.setForwardMessage,
        showThreadButton,
        attachDocActions.setAttachDocument,
        deleteActions.setDeleteMessage,
        reactionActions.setReactionMessage,
        seenUsers,
        channel
      ]
    )

    const Header = useCallback(() => {
      if (hasOlderMessages && !isLoading) {
        return (
          <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
            <Loader />
          </div>
        )
      }
      return null
    }, [hasOlderMessages, isLoading])

    const Footer = useCallback(() => {
      if (hasNewMessages) {
        return (
          <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
            <Loader />
          </div>
        )
      }
      return null
    }, [hasNewMessages])

    //Khi người dùng scroll lên đầu danh sách, nếu có thể, load thêm tin nhắn cũ
    const handleAtTopStateChange = useCallback(
      (atTop: boolean) => {
        if (atTop && hasOlderMessages && isInitialLoadComplete && !isLoadingMessages) {
          setIsLoadingMessages(true)
          loadOlderMessages().finally(() => {
            setTimeout(() => setIsLoadingMessages(false), 500)
          })
        }
      },
      [hasOlderMessages, loadOlderMessages, isInitialLoadComplete, isLoadingMessages]
    )

    //Khi user scroll tới đáy, clear toàn bộ "new messages" badge.
    const handleAtBottomStateChange = useCallback(
      (atBottom: boolean) => {
        setIsAtBottom(atBottom)
        if (atBottom) {
          clearAllNewMessages()
        }
      },
      [clearAllNewMessages]
    )

    //Load thêm tin nhắn mới nếu người dùng gần đáy.
    //Đánh dấu những tin nhắn mới nào đang hiển thị là đã xem sau 1 giây.
    const handleRangeChanged = useCallback(
      (range: any) => {
        if (!messages || !isInitialLoadComplete) return

        // FIX: Chỉ tránh auto-load trong khoảng thời gian ngắn sau khi initial load với message_id
        const shouldLoadNewer =
          hasNewMessages &&
          range &&
          range.endIndex >= messages.length - 5 &&
          !isLoadingMessages &&
          !hasInitialLoadedWithMessageId.current // Chỉ tránh auto-load trong thời gian ngắn sau initial load

        if (shouldLoadNewer) {
          setIsLoadingMessages(true)
          loadNewerMessages().finally(() => {
            setTimeout(() => setIsLoadingMessages(false), 500)
          })
        }

        // Track tin nhắn đã được xem trong viewport - KHÔNG phụ thuộc vào message_id
        if (range && newMessageIds.size > 0) {
          const visibleMessages = messages.slice(range.startIndex, range.endIndex + 1)

          visibleMessages.forEach((message: any) => {
            if (message.name && newMessageIds.has(message.name)) {
              setTimeout(() => {
                markMessageAsSeen(message.name)
              }, 1000)
            }
          })
        }
      },
      [
        hasNewMessages,
        loadNewerMessages,
        messages,
        isInitialLoadComplete,
        newMessageIds,
        markMessageAsSeen,
        isLoadingMessages
      ]
    )

    const handleGoToLatestMessages = useCallback(() => {
      clearAllNewMessages()
      goToLatestMessages()
    }, [clearAllNewMessages, goToLatestMessages])

    const virtuosoComponents = useMemo(
      () => ({
        Header: isInitialLoadComplete && hasOlderMessages ? Header : undefined,
        Footer: hasNewMessages ? Footer : undefined
      }),
      [isInitialLoadComplete, hasOlderMessages, hasNewMessages, Header, Footer]
    )

    const scrollActionToBottom = useCallback(() => {
      if (virtuosoRef.current && messages && messages.length > 0) {
        requestAnimationFrame(() => {
          virtuosoRef.current.scrollToIndex({
            index: messages.length - 1,
            behavior: 'auto',
            align: 'end'
          })
        })
      }
    }, [messages, virtuosoRef])

    return (
      <div className='relative h-full flex flex-col overflow-hidden pb-16 sm:pb-0'>
        {/* Empty state */}
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}

        {/* Loading state */}
        {isLoading && <ChatStreamLoader />}

        {/* Error state */}
        {error && <ErrorBanner error={error} />}

        {/* Messages */}
        {messages && messages.length > 0 && (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            itemContent={itemRenderer}
            followOutput={isAtBottom ? 'auto' : false}
            initialTopMostItemIndex={!isSavedMessage ? messages.length - 1 : targetIndex}
            atTopStateChange={handleAtTopStateChange}
            atBottomStateChange={handleAtBottomStateChange}
            rangeChanged={handleRangeChanged}
            computeItemKey={(index, item) => item?.name}
            components={virtuosoComponents}
            style={{ height: '100%', willChange: 'transform' }}
            increaseViewportBy={300}
            overscan={200}
            initialItemCount={20}
            defaultItemHeight={50}
            useWindowScroll={false}
          />
        )}

        {/* Scroll to bottom buttons */}
        <ScrollToBottomButtons
          hasNewMessages={hasNewMessages}
          newMessageCount={newMessageCount}
          onGoToLatestMessages={handleGoToLatestMessages}
          onScrollToBottom={scrollActionToBottom}
          isAtBottom={isAtBottom}
          hasMessageId={!!messageId}
        />

        {/* Dialogs */}
        <ChatDialogs
          deleteProps={deleteActions}
          editProps={editActions}
          forwardProps={forwardActions}
          attachDocProps={attachDocActions}
          reactionProps={reactionActions}
        />
      </div>
    )
  }
)

export default memo(ChatStream)
