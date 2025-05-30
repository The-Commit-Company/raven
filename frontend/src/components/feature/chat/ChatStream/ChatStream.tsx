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
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react'
import { useLocation } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { Message } from '../../../../../../types/Messaging/Message'
import { ChatDialogs } from './ChatDialogs'
import ChatStreamLoader from './ChatStreamLoader'
import { MessageItemRenderer } from './MessageListRenderer'
import { ScrollToBottomButtons } from './ScrollToBottomButtons'
import useChatStream from './useChatStream'
import { useChatStreamActions } from './useChatStreamActions'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useDebounce } from '@/hooks/useDebounce'
import { useMessageHighlight } from './useMessageHighlight'

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
    // State để track việc initial load đã hoàn thành chưa
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(false)
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const isSavedMessage = searchParams.has('message_id')
    const messageId = searchParams.get('message_id')

    const [lastTrackedSequence, setLastTrackedSequence] = useState<number>(0)
    const { call } = useContext(FrappeContext) as FrappeConfig

    const [pendingSeenSequence, setPendingSeenSequence] = useState<number | null>(null)
    const debouncedSeenSequence = useDebounce(pendingSeenSequence, 1500)

    useEffect(() => {
      if (debouncedSeenSequence && debouncedSeenSequence > lastTrackedSequence) {
        setLastTrackedSequence(debouncedSeenSequence)
        call
          .post('raven.api.raven_channel_member.track_visit', {
            channel_id: channelID,
            last_seen_sequence: debouncedSeenSequence
          })
          .catch((err) => {
            console.error('Gửi last_seen_sequence thất bại:', err)
          })
      }
    }, [debouncedSeenSequence])
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
      newMessageIds,
      markMessageAsSeen,
      clearAllNewMessages
    } = useChatStream(channelID, virtuosoRef, pinnedMessagesString, isAtBottom)

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

    const [scrolledHighlightedMessage, setScrolledHighlightedMessage] = useState<string | null>(null)
    useMessageHighlight(scrolledHighlightedMessage, setScrolledHighlightedMessage)

    // Item renderer cho Virtuoso
    const itemRenderer = useCallback(
      (index: number) => {
        if (!messages || !messages[index]) return null
        const message = messages[index]
        return (
          <MessageItemRenderer
            message={message}
            isHighlighted={highlightedMessage === message?.name || scrolledHighlightedMessage === message?.name}
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
        setIsAtBottom(atBottom)
        if (atBottom) {
          // Reset tất cả tin nhắn mới khi scroll đến bottom
          clearAllNewMessages()
        }
      },
      [clearAllNewMessages]
    )

    // Handle range changed for loading newer messages and tracking visible messages
    const handleRangeChanged = useCallback(
      (range: any) => {
        if (!messages || !isInitialLoadComplete) return

        console.log(messages.map((m: any) => m.sequence))
        const isNearBottom = range && range.endIndex >= messages.length - 5

        if (range && hasNewMessages && isNearBottom) {
          loadNewerMessages()
        }

        console.log('>>>>>>>range:', messages[range.endIndex])

        if (range) {
          const lastVisibleMessage = messages[range.endIndex]
          // console.log('sequence = ', lastVisibleMessage?.sequence)

          if (lastVisibleMessage) {
            const { name, sequence } : any = lastVisibleMessage
            console.log('lastVisibleMessage.sequence', sequence)

            markMessageAsSeen(name, sequence)
            localStorage.setItem(`lastReadMessage_${channelID}`, `${sequence}`)
            setPendingSeenSequence(sequence)

            // Optional: sync with server
            // syncLastSeenSequence(channelID, sequence)
          }
        }
      },
      [
        hasNewMessages,
        loadNewerMessages,
        messages,
        isInitialLoadComplete,
        markMessageAsSeen,
        channelID,
        setPendingSeenSequence
      ]
    )

    // Custom go to latest messages function
    const handleGoToLatestMessages = useCallback(() => {
      clearAllNewMessages()
      goToLatestMessages()
    }, [clearAllNewMessages, goToLatestMessages])

    const virtuosoComponents = useMemo(
      () => ({
        Header: isInitialLoadComplete && hasOlderMessages ? Header : undefined,
        Footer: hasNewMessages ? Footer : undefined
      }),
      [isInitialLoadComplete, hasOlderMessages, hasNewMessages]
    )

    const scrollActionToBottom = useCallback(() => {
      if (virtuosoRef.current && messages && messages.length > 0) {
        requestAnimationFrame(() => {
          virtuosoRef.current.scrollToIndex({
            index: messages.length - 1,
            behavior: 'smooth',
            align: 'end'
          })
        })
      }
    }, [messages, virtuosoRef])

    const [shouldRenderVirtuoso, setShouldRenderVirtuoso] = useState(false)

    const savedLastSeenSequence = useMemo(() => {
      if (isSavedMessage) return null
      const raw = localStorage.getItem(`lastReadMessage_${channelID}`)
      return raw ? parseInt(raw, 10) : null
    }, [channelID, isSavedMessage])

    const lastSeenIndexBySequence = useMemo(() => {
      if (!messages || !savedLastSeenSequence) return undefined
      return messages.findIndex((msg) => msg.sequence === savedLastSeenSequence)
    }, [messages, savedLastSeenSequence])

    const targetIndex = useMemo(() => {
      if (isSavedMessage && messageId && messages) {
        return messages.findIndex((msg) => msg.name === messageId)
      }

      if (!isSavedMessage && lastSeenIndexBySequence !== undefined && lastSeenIndexBySequence >= 0) {
        return lastSeenIndexBySequence
      }

      return undefined
    }, [isSavedMessage, messageId, messages, lastSeenIndexBySequence])

    useEffect(() => {
      if (!messages || messages.length === 0) return

      // Chờ đến khi targetIndex được tính ra (hoặc quyết định mặc định scroll cuối)
      if (targetIndex !== undefined || (!isSavedMessage && messages.length > 0)) {
        setShouldRenderVirtuoso(true)
      }
    }, [targetIndex, messages, isSavedMessage])

    const shouldFollowOutput = useMemo(() => {
      // Nếu vào với message_id hoặc localStorage thì không nên scroll theo output
      if (isSavedMessage || targetIndex !== undefined) return false
      return isAtBottom
    }, [isSavedMessage, targetIndex, isAtBottom])
    // const targetIndex = useMemo(() => {
    //   if (!messageId || !messages) return undefined
    //   return messages.findIndex((msg) => msg.name === messageId)
    // }, [messageId, messages])

    // 1. Tính index của message đã xem
    // const lastSeenMessageIndex = useMemo(() => {
    //   if (!messages || !seenUsers?.length) return -1

    //   const seenUser = seenUsers.find((u) => u.user_id === userID)
    //   if (!seenUser) return -1

    //   return messages.findIndex((msg: any) => msg.sequence === seenUser.last_seen_sequence)
    // }, [messages, seenUsers, userID])

    // // 2. Scroll sau khi Virtuoso mount
    // useEffect(() => {
    //   if (lastSeenMessageIndex !== -1 && virtuosoRef.current) {
    //     setTimeout(() => {
    //       virtuosoRef.current.scrollToIndex({
    //         index: lastSeenMessageIndex,
    //         align: 'start',
    //         behavior: 'smooth'
    //       })
    //     }, 500) // đảm bảo Virtuoso đã render
    //   }
    // }, [lastSeenMessageIndex])

    useEffect(() => {
      if (shouldRenderVirtuoso && targetIndex !== undefined && virtuosoRef.current && messageId) {
        setTimeout(() => {
          virtuosoRef.current?.scrollToIndex({
            index: targetIndex,
            align: 'center',
            behavior: 'smooth'
          })
          const targetMessage = messages[targetIndex]
          if (targetMessage?.name) {
            setScrolledHighlightedMessage(targetMessage.name)
          }
        }, 100)
      }
    }, [shouldRenderVirtuoso, targetIndex, messageId])

    return (
      <div className='relative h-full flex flex-col overflow-hidden pb-16 sm:pb-0'>
        {/* Empty state */}
        {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}

        {/* Loading state */}
        {isLoading && <ChatStreamLoader />}

        {/* Error state */}
        {error && <ErrorBanner error={error} />}

        {/* Messages */}
        {shouldRenderVirtuoso && messages && messages.length > 0 && (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            totalCount={messages.length}
            itemContent={itemRenderer}
            followOutput={shouldFollowOutput ? 'auto' : false}
            initialTopMostItemIndex={!targetIndex ? messages.length - 1 : targetIndex}
            atTopStateChange={handleAtTopStateChange}
            atBottomStateChange={handleAtBottomStateChange}
            rangeChanged={handleRangeChanged}
            components={virtuosoComponents}
            style={{ height: '100%' }}
            className='pb-4'
            overscan={200}
            initialItemCount={20}
            defaultItemHeight={50}
          />
        )}

        {/* Scroll to bottom buttons */}
        <ScrollToBottomButtons
          hasNewMessages={hasNewMessages}
          newMessageCount={newMessageCount}
          onGoToLatestMessages={handleGoToLatestMessages}
          onScrollToBottom={scrollActionToBottom}
          isAtBottom={isAtBottom}
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
