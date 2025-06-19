// useChatStream.ts - Updated for better initial load handling with new message tracking
import { MutableRefObject, useCallback, useEffect } from 'react'
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
  pinnedMessagesString?: string,
  isAtBottom?: boolean
) => {
  // Initialize all state and refs
  const messageState = useMessageState()
  const { scrollToBottom, scrollToMessage: scrollToMessageElement } = useScrollBehavior(virtuosoRef)

  // Handle message highlighting
  useMessageHighlight(messageState.highlightedMessage, messageState.setHighlightedMessage)

  // Callback để handle tin nhắn mới được thêm
  const handleNewMessageAdded = useCallback(
    (messageId: string) => {
      messageState.addNewMessage(messageId)
    },
    [messageState.addNewMessage]
  )

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

  // WebSocket event handling với callback cho tin nhắn mới
  useWebSocketEvents(
    channelID,
    api.mutate,
    scrollToBottom,
    messageState.setHasNewMessages,
    messageState.setNewMessageCount,
    handleNewMessageAdded, // Truyền callback
    isAtBottom
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
    messageState.latestMessagesLoaded
  )

  // Channel switch effect - chỉ scroll to bottom khi KHÔNG có message_id
  useEffect(() => {
    const messageId = messageState.searchParams.get('message_id')
    if (!messageId) {
      // Use a small delay to ensure Virtuoso is ready
      const timer = setTimeout(() => {
        if (virtuosoRef.current) {
          virtuosoRef.current.scrollToIndex({
            index: 'LAST',
            behavior: 'auto',
            align: 'end'
          })
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [channelID, messageState.searchParams])

  // Effect để handle khi có message_id trong URL - trigger highlight
  useEffect(() => {
    const messageId = messageState.searchParams.get('message_id')
    if (messageId && messages) {
      // Set highlighted message khi có message_id trong URL
      messageState.setHighlightedMessage(messageId)
    }
  }, [messageState.searchParams, messages, messageState.setHighlightedMessage])

  // Reset tin nhắn mới khi chuyển channel
  useEffect(() => {
    messageState.clearAllNewMessages()
  }, [channelID])

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
    messageState.setNewMessageCount(0)
    scrollToBottom('auto')
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
    // Export các function mới để quản lý tin nhắn mới
    newMessageIds: messageState.newMessageIds,
    markMessageAsSeen: messageState.markMessageAsSeen,
    clearAllNewMessages: messageState.clearAllNewMessages,
    scrollToBottom
  }
}

export default useChatStream
