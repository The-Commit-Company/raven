// ChatStream.tsx - Ultra optimized version for low-end devices
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState/EmptyState'
import { useChannelSeenUsers } from '@/hooks/useChannelSeenUsers'
import { useCurrentChannelData } from '@/hooks/useCurrentChannelData'
import { useDebounceDynamic } from '@/hooks/useDebounce'
import { useUserData } from '@/hooks/useUserData'
import { virtuosoSettings } from '@/utils/VirtuosoSettings'
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

// 🔥 PERFORMANCE: Animation frame scheduler for smooth operations
const useAnimationFrame = () => {
  const rafRef = useRef<number>()

  const schedule = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(callback)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return schedule
}

const ChatStream = forwardRef<VirtuosoHandle, Props>(
  ({ channelID, replyToMessage, showThreadButton = true, pinnedMessagesString, onModalClose, virtuosoRef }, ref) => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const isSavedMessage = searchParams.has('message_id')
    const messageId = searchParams.get('message_id')

    // 🔥 SCROLLBAR OPTIMIZATION: States for smooth scrollbar handling
    const [isVirtuosoReady, setIsVirtuosoReady] = useState(false)
    const [isContentMeasured, setIsContentMeasured] = useState(false)
    const [scrollbarVisible, setScrollbarVisible] = useState(false)
    const [initialRenderComplete, setInitialRenderComplete] = useState(false)

    // Performance states
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(false)
    const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)

    // Refs for performance optimization
    const lastScrollTopRef = useRef(0)
    const hasInitialLoadedWithMessageId = useRef(false)
    const scrollTimeoutRef = useRef<NodeJS.Timeout>()
    const isScrollingRef = useRef(false)
    const initialRenderRef = useRef(true)
    const measureTimeoutRef = useRef<NodeJS.Timeout>()

    // Animation frame scheduler
    const scheduleFrame = useAnimationFrame()

    // Reset state khi channelID hoặc messageId thay đổi
    useEffect(() => {
      setIsInitialLoadComplete(false)
      setHasScrolledToTarget(false)
      setIsLoadingMessages(false)
      setIsVirtuosoReady(false)
      setIsContentMeasured(false)
      setScrollbarVisible(false)
      setInitialRenderComplete(false)
      initialRenderRef.current = true
      lastScrollTopRef.current = 0
      hasInitialLoadedWithMessageId.current = false

      // Clear all timeouts
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      if (measureTimeoutRef.current) clearTimeout(measureTimeoutRef.current)
    }, [channelID, messageId])

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

    // 🔥 SCROLLBAR OPTIMIZATION: Progressive scrollbar reveal
    useEffect(() => {
      if (messages && messages.length > 0 && !isInitialLoadComplete) {
        // Stage 1: Basic content loaded
        setTimeout(() => {
          setIsInitialLoadComplete(true)
        }, 100)

        // Stage 2: Allow Virtuoso to measure content
        setTimeout(() => {
          setIsVirtuosoReady(true)
        }, 200)

        // Stage 3: Content measured, start revealing scrollbar
        setTimeout(() => {
          setIsContentMeasured(true)
        }, 400)

        // Stage 4: Full scrollbar reveal
        setTimeout(() => {
          setScrollbarVisible(true)
          setInitialRenderComplete(true)
        }, 600)
      }
    }, [messages, isInitialLoadComplete])

    // 🔥 PERFORMANCE: Debounced scroll handler
    const debouncedRangeChanged = useDebounceDynamic(
      useCallback(
        (range: any) => {
          if (!messages || !isInitialLoadComplete || !isVirtuosoReady || isScrollingRef.current) return

          const shouldLoadNewer =
            hasNewMessages &&
            range &&
            range.endIndex >= messages.length - 5 &&
            !isLoadingMessages &&
            !hasInitialLoadedWithMessageId.current

          if (shouldLoadNewer) {
            setIsLoadingMessages(true)
            loadNewerMessages().finally(() => {
              setTimeout(() => setIsLoadingMessages(false), 300)
            })
          }

          // Mark messages as seen - heavily throttled
          if (range && newMessageIds.size > 0) {
            const visibleMessages = messages.slice(range.startIndex, range.endIndex + 1)
            visibleMessages.forEach((message: any) => {
              if (message.name && newMessageIds.has(message.name)) {
                setTimeout(() => markMessageAsSeen(message.name), 2000)
              }
            })
          }
        },
        [
          hasNewMessages,
          loadNewerMessages,
          messages,
          isInitialLoadComplete,
          isVirtuosoReady,
          newMessageIds,
          markMessageAsSeen,
          isLoadingMessages
        ]
      ),
      300 // Increased debounce for low-end devices
    )

    const { deleteActions, editActions, forwardActions, attachDocActions, reactionActions } =
      useChatStreamActions(onModalClose)

    const { name: userID } = useUserData()
    const { seenUsers } = useChannelSeenUsers({
      channelId: channelID
    })
    const { channel } = useCurrentChannelData(channelID)

    // 🔥 PERFORMANCE: Ultra-stable callback with minimal dependencies
    const onReplyMessageClick = useCallback(
      (messageID: string) => {
        scheduleFrame(() => scrollToMessage(messageID))
      },
      [scrollToMessage, scheduleFrame]
    )

    const targetIndex = useMemo(() => {
      if (!messageId || !messages) return undefined
      return messages.findIndex((msg) => msg.name === messageId)
    }, [messageId, messages])

    // 🔥 PERFORMANCE: Optimized scroll to target with RAF
    useEffect(() => {
      if (
        isInitialLoadComplete &&
        messageId &&
        messages &&
        targetIndex !== undefined &&
        targetIndex >= 0 &&
        !hasScrolledToTarget &&
        !isLoadingMessages &&
        virtuosoRef.current &&
        isVirtuosoReady
      ) {
        scheduleFrame(() => {
          if (virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
              index: targetIndex,
              behavior: 'auto',
              align: 'center'
            })
            setHasScrolledToTarget(true)
          }
        })
      }
    }, [
      isInitialLoadComplete,
      messageId,
      messages,
      targetIndex,
      hasScrolledToTarget,
      isLoadingMessages,
      virtuosoRef,
      isVirtuosoReady,
      scheduleFrame
    ])

    useImperativeHandle(ref, () => {
      if (!virtuosoRef.current) {
        return {} as VirtuosoHandle
      }

      return {
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
    }, [messages, userID, editActions.setEditMessage])

    // 🔥 PERFORMANCE: Ultra-optimized item renderer with minimal re-renders
    const itemRenderer = useCallback(
      (index: number) => {
        const message = messages?.[index]
        if (!message) return null

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

    // 🔥 PERFORMANCE: Minimal header/footer components
    const Header = useMemo(() => {
      return hasOlderMessages && !isLoading
        ? () => (
            <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
              <Loader />
            </div>
          )
        : undefined
    }, [hasOlderMessages, isLoading])

    const Footer = useMemo(() => {
      return hasNewMessages
        ? () => (
            <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
              <Loader />
            </div>
          )
        : undefined
    }, [hasNewMessages])

    // 🔥 PERFORMANCE: Throttled top state change
    const handleAtTopStateChange = useCallback(
      (atTop: boolean) => {
        if (atTop && hasOlderMessages && isInitialLoadComplete && !isLoadingMessages) {
          isScrollingRef.current = true
          setIsLoadingMessages(true)
          loadOlderMessages().finally(() => {
            setTimeout(() => {
              setIsLoadingMessages(false)
              isScrollingRef.current = false
            }, 300)
          })
        }
      },
      [hasOlderMessages, loadOlderMessages, isInitialLoadComplete, isLoadingMessages]
    )

    const handleAtBottomStateChange = useCallback(
      (atBottom: boolean) => {
        setIsAtBottom(atBottom)
        if (atBottom) {
          scheduleFrame(() => clearAllNewMessages())
        }
      },
      [clearAllNewMessages, scheduleFrame]
    )

    // 🔥 PERFORMANCE: Optimized range change handler
    const handleRangeChanged = useCallback(
      (range: any) => {
        if (!messages || !isInitialLoadComplete || !isVirtuosoReady) return

        if (initialRenderRef.current) {
          initialRenderRef.current = false
          return
        }

        debouncedRangeChanged(range)
      },
      [messages, isInitialLoadComplete, isVirtuosoReady, debouncedRangeChanged]
    )

    const handleGoToLatestMessages = useCallback(() => {
      scheduleFrame(() => {
        clearAllNewMessages()
        goToLatestMessages()
      })
    }, [clearAllNewMessages, goToLatestMessages, scheduleFrame])

    const virtuosoComponents = useMemo(
      () => ({
        Header: isInitialLoadComplete && hasOlderMessages ? Header : undefined,
        Footer: hasNewMessages ? Footer : undefined
      }),
      [isInitialLoadComplete, hasOlderMessages, hasNewMessages, Header, Footer]
    )

    const scrollActionToBottom = useCallback(() => {
      if (virtuosoRef.current && messages && messages.length > 0) {
        scheduleFrame(() => {
          virtuosoRef.current?.scrollToIndex({
            index: messages.length - 1,
            behavior: 'auto',
            align: 'end'
          })
        })
      }
    }, [messages, virtuosoRef, scheduleFrame])

    const computeItemKey = useCallback((index: number, item: any) => {
      return item?.name ?? `fallback-${index}`
    }, [])

    // 🔥 SCROLLBAR STYLING: Dynamic styles for smooth reveal
    const virtuosoStyles = useMemo(
      () => ({
        height: '100%',
        willChange: 'transform',
        transition: initialRenderComplete ? 'opacity 0.3s ease-out' : 'none',
        scrollbarWidth: scrollbarVisible ? 'thin' : 'none',
        scrollbarColor: scrollbarVisible ? 'rgba(155, 155, 155, 0.5) transparent' : 'transparent transparent',
        '--scrollbar-width': scrollbarVisible ? '6px' : '0px',
        '--scrollbar-opacity': scrollbarVisible ? '0.5' : '0'
      }),
      [initialRenderComplete, scrollbarVisible]
    )

    return (
      <div className='relative h-full flex flex-col overflow-hidden pb-16 sm:pb-0'>
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}

        {isLoading && <ChatStreamLoader />}

        {error && <ErrorBanner error={error} />}

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
            computeItemKey={computeItemKey}
            components={virtuosoComponents}
            style={virtuosoStyles as any}
            {...virtuosoSettings}
            useWindowScroll={false}
            totalListHeightChanged={() => {
              if (!isContentMeasured) {
                measureTimeoutRef.current = setTimeout(() => {
                  setIsContentMeasured(true)
                }, 100)
              }
            }}
          />
        )}

        <ScrollToBottomButtons
          hasNewMessages={hasNewMessages}
          newMessageCount={newMessageCount}
          onGoToLatestMessages={handleGoToLatestMessages}
          onScrollToBottom={scrollActionToBottom}
          isAtBottom={isAtBottom}
          hasMessageId={!!messageId}
        />

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
