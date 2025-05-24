import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState/EmptyState'
import { useChannelSeenUsers } from '@/hooks/useChannelSeenUsers'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useUserData } from '@/hooks/useUserData'
import { forwardRef, MutableRefObject, useImperativeHandle } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'
import { ChatDialogs } from './ChatDialogs'
import ChatStreamLoader from './ChatStreamLoader'
import { MessageListRenderer } from './MessageListRenderer'
import { ScrollToBottomButtons } from './ScrollToBottomButtons'
import useChatStream from './useChatStream'
import { useChatStreamActions } from './useChatStreamActions'
import { useScrollToBottomEffect } from './useScrollToBottomEffect'
import { ChatStreamLoading } from './ChatStreamLoading'

type Props = {
  channelID: string
  replyToMessage: (message: Message) => void
  showThreadButton?: boolean
  scrollRef: MutableRefObject<HTMLDivElement | null>
  pinnedMessagesString?: string
  onModalClose?: () => void
}

const ChatStream = forwardRef<any, Props>(
  ({ channelID, replyToMessage, showThreadButton = true, pinnedMessagesString, scrollRef, onModalClose }, ref) => {
    // Sử dụng hook chính
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

    // Sử dụng hook actions
    const { deleteActions, editActions, forwardActions, attachDocActions, reactionActions } =
      useChatStreamActions(onModalClose)

    // Sử dụng scroll effect
    useScrollToBottomEffect(scrollRef)

    // Lấy dữ liệu cần thiết
    const { name: userID } = useUserData()
    const { seenUsers } = useChannelSeenUsers(channelID)
    const { channel } = useCurrentChannelData(channelID)

    // Handle reply message click
    const onReplyMessageClick = (messageID: string) => {
      scrollToMessage(messageID)
    }

    // Imperative handle cho up arrow
    useImperativeHandle(ref, () => ({
      onUpArrow: () => {
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1]
          if (lastMessage.message_type === 'Text' && lastMessage.owner === userID && !lastMessage.is_bot_message) {
            editActions.setEditMessage(lastMessage)
          }
        }
      }
    }))

    return (
      <div className='relative h-full flex flex-col overflow-y-auto pb-16 sm:pb-0' ref={scrollRef}>
        {/* Loaders */}
        <ChatStreamLoading
          hasOlderMessages={hasOlderMessages}
          hasNewMessages={hasNewMessages}
          isLoading={isLoading}
          onLoadOlderMessages={loadOlderMessages}
          onLoadNewerMessages={loadNewerMessages}
        />

        {/* Empty state */}
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}

        {/* Loading state */}
        {isLoading && <ChatStreamLoader />}

        {/* Error state */}
        {error && <ErrorBanner error={error} />}

        {/* Messages */}
        <MessageListRenderer
          messages={messages as Message[]}
          isLoading={isLoading}
          highlightedMessage={highlightedMessage}
          messageRefs={messageRefs}
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

        {/* Scroll to bottom buttons */}
        <ScrollToBottomButtons
          hasNewMessages={hasNewMessages}
          newMessageCount={newMessageCount}
          showScrollToBottomButton={showScrollToBottomButton}
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
