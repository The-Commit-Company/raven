import { MutableRefObject, useEffect } from 'react'
import { useMessageAPI } from './useMessageAPI'
import { useMessageHighlight } from './useMessageHighlight'
import { useMessageLoading } from './useMessageLoading'
import { useMessageProcessing } from './useMessageProcessing'
import { useMessageState } from './useMessageState'
import { useScrollBehavior } from './useScrollBehavior'
import { useScrollHandling } from './useScrollHandling'
import { useWebSocketEvents } from './useWebSocketEvents'

const useChatStream = (
  channelID: string,
  scrollRef: MutableRefObject<HTMLDivElement | null>,
  pinnedMessagesString?: string
) => {
  // Initialize all state and refs
  const messageState = useMessageState()
  const { scrollToBottom, scrollToMessage: scrollToMessageElement } = useScrollBehavior(scrollRef)

  // Handle message highlighting
  useMessageHighlight(messageState.highlightedMessage, messageState.setHighlightedMessage)

  // API calls and data fetching
  const api = useMessageAPI(
    channelID,
    messageState.selected_message,
    messageState.highlightedMessage,
    scrollToBottom,
    scrollToMessageElement,
    messageState.latestMessagesLoaded
  )

  // WebSocket event handling
  useWebSocketEvents(
    channelID,
    api.mutate,
    scrollRef,
    scrollToBottom,
    messageState.setHasNewMessages,
    messageState.setNewMessageCount,
    messageState.setUnreadMessageIds
  )

  // Message loading functionality
  const { loadOlderMessages, loadNewerMessages } = useMessageLoading(
    api.data,
    api.mutate,
    api.fetchOlderMessages,
    api.fetchNewerMessages,
    api.loadingOlderMessages,
    api.loadingNewerMessages,
    channelID,
    scrollRef,
    messageState.highlightedMessage,
    scrollToBottom,
    messageState.latestMessagesLoaded
  )

  // Process and format messages
  const messages = useMessageProcessing(api.data, pinnedMessagesString)

  // Scroll handling
  useScrollHandling(
    scrollRef,
    messageState.setNewMessageCount,
    messageState.setSearchParams,
    messageState.setHasNewMessages,
    messageState.setShowScrollToBottomButton,
    messageState.unreadMessageIds,
    messageState.setUnreadMessageIds,
    messageState.messageRefs
  )

  // Channel switch effect
  useEffect(() => {
    if (!messageState.searchParams.get('message_id')) {
      scrollToBottom()
    }
  }, [channelID, scrollToBottom])

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
    const messageIndex = messages?.findIndex((message) => message.name === messageID)

    if (messageIndex !== undefined && messageIndex !== -1) {
      document.getElementById(`message-${messageID}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
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
    scrollToBottom('smooth')
    messageState.setNewMessageCount(0)
    messageState.setShowScrollToBottomButton(false)
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
    messageRefs: messageState.messageRefs,
    showScrollToBottomButton: messageState.showScrollToBottomButton
  }
}

export default useChatStream
