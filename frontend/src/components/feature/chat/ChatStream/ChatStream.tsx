// ChatStream.tsx - Fixed auto-scroll and load older messages issue
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState/EmptyState'
import { useChannelSeenUsers } from '@/hooks/useChannelSeenUsers'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useUserData } from '@/hooks/useUserData'
import { forwardRef, MutableRefObject, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { Message } from '../../../../../../types/Messaging/Message'
import { ChatDialogs } from './ChatDialogs'
import ChatStreamLoader from './ChatStreamLoader'
import { MessageItemRenderer } from './MessageListRenderer'
import { ScrollToBottomButtons } from './ScrollToBottomButtons'
import useChatStream from './useChatStream'
import { useChatStreamActions } from './useChatStreamActions'

type Props = {
  channelID: string
  replyToMessage: (message: Message) => void
  showThreadButton?: boolean
  pinnedMessagesString?: string
  onModalClose?: () => void
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>
}

const ChatStream = forwardRef<VirtuosoHandle, Props>(
  ({ channelID, replyToMessage, showThreadButton = true, pinnedMessagesString, onModalClose, virtuosoRef }, ref) => {
    // State để track việc initial load đã hoàn thành chưa
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

    // Reset initial load state khi chuyển channel
    useEffect(() => {
      setIsInitialLoadComplete(false)
    }, [channelID])

    // Sử dụng hook chính với Virtuoso ref
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
      setHasNewMessages,
      setNewMessageCount
    } = useChatStream(channelID, virtuosoRef, pinnedMessagesString)

    // Đánh dấu initial load complete khi messages được load lần đầu
    useEffect(() => {
      if (messages && messages.length > 0 && !isInitialLoadComplete) {
        // Delay một chút để đảm bảo Virtuoso đã render xong
        setTimeout(() => {
          setIsInitialLoadComplete(true)
        }, 100)
      }
    }, [messages, isInitialLoadComplete])

    // Sử dụng hook actions
    const { deleteActions, editActions, forwardActions, attachDocActions, reactionActions } =
      useChatStreamActions(onModalClose)

    // Lấy dữ liệu cần thiết
    const { name: userID } = useUserData()
    const { seenUsers } = useChannelSeenUsers(channelID)
    const { channel } = useCurrentChannelData(channelID)

    // Handle reply message click
    const onReplyMessageClick = (messageID: string) => {
      scrollToMessage(messageID)
    }

    // Imperative handle cho up arrow
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
    })

    // Item renderer cho Virtuoso
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

    // Header component for loading older messages
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

    // Footer component for loading newer messages
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

    // Handle scroll state changes - CHỈ load older messages khi user đã interact
    const handleAtTopStateChange = useCallback(
      (atTop: boolean) => {
        // CHỈ load older messages khi:
        // 1. Initial load đã hoàn thành
        // 2. User đang ở top
        // 3. Còn tin nhắn cũ để load
        if (atTop && hasOlderMessages && isInitialLoadComplete) {
          loadOlderMessages()
        }
      },
      [hasOlderMessages, loadOlderMessages, isInitialLoadComplete]
    )

    const handleAtBottomStateChange = useCallback(
      (atBottom: boolean) => {
        if (atBottom) {
          setHasNewMessages(false)
          setNewMessageCount(0)
        }
      },
      [setHasNewMessages, setNewMessageCount]
    )

    // Handle range changed for loading newer messages
    const handleRangeChanged = useCallback(
      (range: any) => {
        // If user scrolled to see newer messages that are loaded
        if (!messages || !isInitialLoadComplete) return
        if (range && hasNewMessages && range.endIndex >= messages.length - 5) {
          loadNewerMessages()
        }
      },
      [hasNewMessages, loadNewerMessages, messages, isInitialLoadComplete]
    )

    return (
      <div className='relative h-full flex flex-col overflow-hidden pb-16 sm:pb-0'>
        {/* Empty state */}
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}

        {/* Loading state */}
        {isLoading && <ChatStreamLoader />}

        {/* Error state */}
        {error && <ErrorBanner error={error} />}

        {/* Messages */}
        <Virtuoso
          ref={virtuosoRef}
          data={messages || []}
          totalCount={messages?.length || 0}
          itemContent={itemRenderer}
          components={{
            Header,
            Footer
          }}
          followOutput='smooth'
          alignToBottom
          atTopStateChange={handleAtTopStateChange}
          atBottomStateChange={handleAtBottomStateChange}
          rangeChanged={handleRangeChanged}
          style={{ height: '100%' }}
          className='pb-4'
          // Thêm props để tối ưu performance
          overscan={200}
          initialTopMostItemIndex={messages?.length ? messages.length - 1 : 0}
        />

        {/* Scroll to bottom buttons */}
        <ScrollToBottomButtons
          hasNewMessages={hasNewMessages}
          newMessageCount={newMessageCount}
          onGoToLatestMessages={goToLatestMessages}
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

export default ChatStream
