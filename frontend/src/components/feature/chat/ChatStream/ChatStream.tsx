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
  useReducer,
  useRef
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

interface ScrollState {
  isAtBottom: boolean
  hasScrolledToTarget: boolean
  isScrolling: boolean
  lastScrollTop: number
}

interface RenderState {
  isVirtuosoReady: boolean
  isContentMeasured: boolean
  initialRenderComplete: boolean
  isInitialLoadComplete: boolean
}

interface LoadingState {
  isLoadingMessages: boolean
  hasInitialLoadedWithMessageId: boolean
}

const scrollStateReducer = (state: ScrollState, action: any): ScrollState => {
  switch (action.type) {
    case 'SET_AT_BOTTOM':
      return { ...state, isAtBottom: action.payload }
    case 'SET_SCROLLED_TO_TARGET':
      return { ...state, hasScrolledToTarget: action.payload }
    case 'SET_SCROLLING':
      return { ...state, isScrolling: action.payload }
    case 'SET_LAST_SCROLL_TOP':
      return { ...state, lastScrollTop: action.payload }
    case 'RESET':
      return {
        isAtBottom: false,
        hasScrolledToTarget: false,
        isScrolling: false,
        lastScrollTop: 0
      }
    default:
      return state
  }
}

const renderStateReducer = (state: RenderState, action: any): RenderState => {
  switch (action.type) {
    case 'SET_VIRTUOSO_READY':
      return { ...state, isVirtuosoReady: action.payload }
    case 'SET_CONTENT_MEASURED':
      return { ...state, isContentMeasured: action.payload }
    case 'SET_INITIAL_RENDER_COMPLETE':
      return { ...state, initialRenderComplete: action.payload }
    case 'SET_INITIAL_LOAD_COMPLETE':
      return { ...state, isInitialLoadComplete: action.payload }
    case 'RESET':
      return {
        isVirtuosoReady: false,
        isContentMeasured: false,
        initialRenderComplete: false,
        isInitialLoadComplete: false
      }
    default:
      return state
  }
}

const loadingStateReducer = (state: LoadingState, action: any): LoadingState => {
  switch (action.type) {
    case 'SET_LOADING_MESSAGES':
      return { ...state, isLoadingMessages: action.payload }
    case 'SET_INITIAL_LOADED_WITH_MESSAGE_ID':
      return { ...state, hasInitialLoadedWithMessageId: action.payload }
    case 'RESET':
      return {
        isLoadingMessages: false,
        hasInitialLoadedWithMessageId: false
      }
    default:
      return state
  }
}

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

    const [scrollState, dispatchScrollState] = useReducer(scrollStateReducer, {
      isAtBottom: false,
      hasScrolledToTarget: false,
      isScrolling: false,
      lastScrollTop: 0
    })

    const [renderState, dispatchRenderState] = useReducer(renderStateReducer, {
      isVirtuosoReady: false,
      isContentMeasured: false,
      initialRenderComplete: false,
      isInitialLoadComplete: false
    })

    const [loadingState, dispatchLoadingState] = useReducer(loadingStateReducer, {
      isLoadingMessages: false,
      hasInitialLoadedWithMessageId: false
    })

    const scrollTimeoutRef = useRef<NodeJS.Timeout>()
    const initialRenderRef = useRef(true)
    const measureTimeoutRef = useRef<NodeJS.Timeout>()

    const scheduleFrame = useAnimationFrame()

    useEffect(() => {
      dispatchScrollState({ type: 'RESET' })
      dispatchRenderState({ type: 'RESET' })
      dispatchLoadingState({ type: 'RESET' })

      initialRenderRef.current = true

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
    } = useChatStream(channelID, virtuosoRef, pinnedMessagesString, scrollState.isAtBottom)

    useEffect(() => {
      if (messages && messages?.length > 0 && !renderState.isInitialLoadComplete) {
        setTimeout(() => {
          dispatchRenderState({ type: 'SET_INITIAL_LOAD_COMPLETE', payload: true })
        }, 100)
        setTimeout(() => dispatchRenderState({ type: 'SET_VIRTUOSO_READY', payload: true }), 200)
        setTimeout(() => dispatchRenderState({ type: 'SET_CONTENT_MEASURED', payload: true }), 300)
        setTimeout(() => dispatchRenderState({ type: 'SET_INITIAL_RENDER_COMPLETE', payload: true }), 500)
      }
    }, [messages, renderState.isInitialLoadComplete])

    const debouncedRangeChanged = useDebounceDynamic(
      useCallback(
        (range: any) => {
          if (
            !messages ||
            !renderState.isInitialLoadComplete ||
            !renderState.isVirtuosoReady ||
            scrollState.isScrolling
          )
            return

          const shouldLoadNewer =
            hasNewMessages &&
            range &&
            range.endIndex >= messages?.length - 5 &&
            !loadingState.isLoadingMessages &&
            !loadingState.hasInitialLoadedWithMessageId

          if (shouldLoadNewer) {
            dispatchLoadingState({ type: 'SET_LOADING_MESSAGES', payload: true })
            loadNewerMessages().finally(() => {
              setTimeout(() => dispatchLoadingState({ type: 'SET_LOADING_MESSAGES', payload: false }), 300)
            })
          }

          if (range && newMessageIds.size > 0) {
            const visibleMessages = messages.slice(range.startIndex, range.endIndex + 1)
            visibleMessages?.forEach((message: any) => {
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
          renderState.isInitialLoadComplete,
          renderState.isVirtuosoReady,
          scrollState.isScrolling,
          loadingState.isLoadingMessages,
          loadingState.hasInitialLoadedWithMessageId,
          newMessageIds,
          markMessageAsSeen
        ]
      ),
      300
    )

    const { deleteActions, editActions, forwardActions, attachDocActions, reactionActions } =
      useChatStreamActions(onModalClose)

    const { name: userID } = useUserData()
    const { seenUsers } = useChannelSeenUsers({
      channelId: channelID
    })
    const { channel } = useCurrentChannelData(channelID)

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

    useEffect(() => {
      if (
        renderState.isInitialLoadComplete &&
        messageId &&
        messages &&
        targetIndex !== undefined &&
        targetIndex >= 0 &&
        !scrollState.hasScrolledToTarget &&
        !loadingState.isLoadingMessages &&
        virtuosoRef.current &&
        renderState.isVirtuosoReady
      ) {
        scheduleFrame(() => {
          if (virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
              index: targetIndex,
              behavior: 'auto',
              align: 'center'
            })
            dispatchScrollState({ type: 'SET_SCROLLED_TO_TARGET', payload: true })
          }
        })
      }
    }, [
      renderState.isInitialLoadComplete,
      renderState.isVirtuosoReady,
      scrollState.hasScrolledToTarget,
      loadingState.isLoadingMessages,
      messageId,
      messages,
      targetIndex,
      virtuosoRef,
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
            const lastMessage = messages[messages?.length - 1]
            if (lastMessage.message_type === 'Text' && lastMessage.owner === userID && !lastMessage.is_bot_message) {
              editActions.setEditMessage(lastMessage)
            }
          }
        }
      }
    }, [messages, userID, editActions.setEditMessage])

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

    const handleAtTopStateChange = useCallback(
      (atTop: boolean) => {
        if (atTop && hasOlderMessages && renderState.isInitialLoadComplete && !loadingState.isLoadingMessages) {
          dispatchScrollState({ type: 'SET_SCROLLING', payload: true })
          dispatchLoadingState({ type: 'SET_LOADING_MESSAGES', payload: true })

          loadOlderMessages().finally(() => {
            setTimeout(() => {
              dispatchLoadingState({ type: 'SET_LOADING_MESSAGES', payload: false })
              dispatchScrollState({ type: 'SET_SCROLLING', payload: false })
            }, 300)
          })
        }
      },
      [hasOlderMessages, loadOlderMessages, renderState.isInitialLoadComplete, loadingState.isLoadingMessages]
    )

    const handleAtBottomStateChange = useCallback(
      (atBottom: boolean) => {
        dispatchScrollState({ type: 'SET_AT_BOTTOM', payload: atBottom })
        if (atBottom) {
          scheduleFrame(() => clearAllNewMessages())
        }
      },
      [clearAllNewMessages, scheduleFrame]
    )

    const handleRangeChanged = useCallback(
      (range: any) => {
        if (!messages || !renderState.isInitialLoadComplete || !renderState.isVirtuosoReady) return

        if (initialRenderRef.current) {
          initialRenderRef.current = false
          return
        }

        debouncedRangeChanged(range)
      },
      [messages, renderState.isInitialLoadComplete, renderState.isVirtuosoReady, debouncedRangeChanged]
    )

    const handleGoToLatestMessages = useCallback(() => {
      scheduleFrame(() => {
        clearAllNewMessages()
        goToLatestMessages()
      })
    }, [clearAllNewMessages, goToLatestMessages, scheduleFrame])

    const virtuosoComponents = useMemo(
      () => ({
        Header: renderState.isInitialLoadComplete && hasOlderMessages ? Header : undefined,
        Footer: hasNewMessages ? Footer : undefined
      }),
      [renderState.isInitialLoadComplete, hasOlderMessages, hasNewMessages, Header, Footer]
    )

    const scrollActionToBottom = useCallback(() => {
      if (virtuosoRef.current && messages && messages?.length > 0) {
        scheduleFrame(() => {
          virtuosoRef.current?.scrollToIndex({
            index: messages?.length - 1,
            behavior: 'auto',
            align: 'end'
          })
        })
      }
    }, [messages, virtuosoRef, scheduleFrame])

    const computeItemKey = useCallback((index: number, item: any) => {
      return item?.name ?? `fallback-${index}`
    }, [])

    const virtuosoStyles = useMemo(
      () => ({
        height: '100%',
        willChange: 'transform',
        opacity: renderState.initialRenderComplete ? 1 : 0,
        transform: renderState.initialRenderComplete ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        scrollbarWidth: renderState.initialRenderComplete ? 'thin' : 'none',
        scrollbarColor: renderState.initialRenderComplete
          ? 'rgba(155, 155, 155, 0.5) transparent'
          : 'transparent transparent',
        '--scrollbar-width': renderState.initialRenderComplete ? '6px' : '0px',
        '--scrollbar-opacity': renderState.initialRenderComplete ? '0.5' : '0'
      }),
      [renderState.initialRenderComplete]
    )

    return (
      <div className='relative h-full flex flex-col overflow-hidden pb-16 sm:pb-0'>
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}

        {isLoading && <ChatStreamLoader />}

        {error && <ErrorBanner error={error} />}

        {messages && messages?.length > 0 && (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            itemContent={itemRenderer}
            followOutput={scrollState.isAtBottom ? 'auto' : false}
            initialTopMostItemIndex={!isSavedMessage ? messages?.length - 1 : targetIndex}
            atTopStateChange={handleAtTopStateChange}
            atBottomStateChange={handleAtBottomStateChange}
            rangeChanged={handleRangeChanged}
            computeItemKey={computeItemKey}
            style={virtuosoStyles as any}
            {...virtuosoSettings}
            components={{
              ...virtuosoComponents,
              ScrollSeekPlaceholder: () => <ChatStreamLoader />
            }}
            useWindowScroll={false}
            totalListHeightChanged={() => {
              if (!renderState.isContentMeasured) {
                measureTimeoutRef.current = setTimeout(() => {
                  dispatchRenderState({ type: 'SET_CONTENT_MEASURED', payload: true })
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
          isAtBottom={scrollState.isAtBottom}
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
