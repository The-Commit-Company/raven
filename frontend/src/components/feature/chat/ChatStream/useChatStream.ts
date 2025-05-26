// useChatStream.ts - Updated for better initial load handling
import { MutableRefObject, useEffect, useState } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'
import { useMessageAPI } from './useMessageAPI'
import { useMessageHighlight } from './useMessageHighlight'
import { useMessageLoading } from './useMessageLoading'
import { useMessageProcessing } from './useMessageProcessing'
import { useMessageState } from './useMessageState'
import { useScrollBehavior } from './useScrollBehavior'
import { useWebSocketEvents } from './useWebSocketEvents'

const useChatStream = (
  channelID: string,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  pinnedMessagesString?: string
) => {
  // State để track việc initial load
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  // Reset khi chuyển channel
  useEffect(() => {
    setIsInitialLoadComplete(false)
  }, [channelID])

  // Initialize all state and refs
  const messageState = useMessageState()
  const { scrollToBottom, scrollToMessage: scrollToMessageElement } = useScrollBehavior(virtuosoRef)

  // Handle message highlighting
  useMessageHighlight(messageState.highlightedMessage, messageState.setHighlightedMessage)

  // API calls and data fetching
  const api = useMessageAPI(
    channelID,
    messageState.selected_message,
    messageState.highlightedMessage,
    scrollToBottom,
    (messageID: string) => scrollToMessageElement(messageID, []), // Will be updated with actual messages
    messageState.latestMessagesLoaded
  )

  // Process and format messages
  const messages = useMessageProcessing(api.data, pinnedMessagesString)

  // Đánh dấu initial load complete khi có messages
  useEffect(() => {
    if (messages && messages.length > 0 && !isInitialLoadComplete) {
      // Delay để đảm bảo Virtuoso render xong
      const timer = setTimeout(() => {
        setIsInitialLoadComplete(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [messages, isInitialLoadComplete])

  // WebSocket event handling
  useWebSocketEvents(
    channelID,
    api.mutate,
    virtuosoRef,
    scrollToBottom,
    messageState.setHasNewMessages,
    messageState.setNewMessageCount,
    messageState.setUnreadMessageIds
  )

  // Message loading functionality for Virtuoso
  const { loadOlderMessages, loadNewerMessages } = useMessageLoading(
    api.data,
    api.mutate,
    api.fetchOlderMessages,
    api.fetchNewerMessages,
    api.loadingOlderMessages,
    api.loadingNewerMessages,
    channelID,
    virtuosoRef,
    messageState.highlightedMessage,
    scrollToBottom,
    messageState.latestMessagesLoaded,
    isInitialLoadComplete // Pass state xuống
  )

  // Channel switch effect - chỉ scroll khi initial load complete
  useEffect(() => {
    if (!messageState.searchParams.get('message_id') && isInitialLoadComplete) {
      scrollToBottom()
    }
  }, [channelID, scrollToBottom, isInitialLoadComplete])

  // Track visit on unmount
  useEffect(() => {
    return () => {
      if (messageState.latestMessagesLoaded.current) {
        api.trackVisit({ channel_id: channelID })
      }
    }
  }, [channelID])

  // Scroll to message function
  const scrollToMessage = (messageID: string) => {
    if (messages) {
      scrollToMessageElement(messageID, messages)
      messageState.setHighlightedMessage(messageID)
    } else {
      messageState.setSearchParams({ message_id: messageID })
      messageState.setHighlightedMessage(messageID)
    }
  }

  // Go to latest messages
  const goToLatestMessages = () => {
    messageState.setSearchParams({})
    messageState.setHasNewMessages(false)
    messageState.setUnreadMessageIds(new Set())
    messageState.setNewMessageCount(0)
    scrollToBottom('smooth')
  }

  return {
    messages,
    hasOlderMessages: api.data?.message.has_old_messages ?? false,
    hasNewMessages: api.data?.message.has_new_messages
      ? api.data?.message.has_new_messages
      : messageState.hasNewMessages,
    newMessageCount: messageState.newMessageCount,
    loadingOlderMessages: api.loadingOlderMessages,
    isLoading: api.isLoading,
    error: api.error,
    loadNewerMessages,
    loadOlderMessages,
    scrollToMessage,
    highlightedMessage: messageState.highlightedMessage,
    goToLatestMessages,
    setHasNewMessages: messageState.setHasNewMessages,
    setNewMessageCount: messageState.setNewMessageCount,
    isInitialLoadComplete // Export state này để ChatStream sử dụng
  }
}

export default useChatStream
