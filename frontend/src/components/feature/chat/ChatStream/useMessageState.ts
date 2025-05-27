import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useMessageState = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected_message = searchParams.get('message_id')

  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [highlightedMessage, setHighlightedMessage] = useState<string | null>(
    selected_message ? selected_message : null
  )

  // Track danh sách tin nhắn mới chưa được xem
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set())

  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const latestMessagesLoaded = useRef(false)

  // Function để thêm tin nhắn mới vào danh sách tracking
  const addNewMessage = (messageId: string) => {
    setNewMessageIds((prev) => new Set([...Array.from(prev), messageId]))
  }

  // Function để đánh dấu tin nhắn đã được xem
  const markMessageAsSeen = (messageId: string) => {
    setNewMessageIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(messageId)
      return newSet
    })

    // Giảm count xuống
    setNewMessageCount((prev) => Math.max(0, prev - 1))

    // Nếu không còn tin nhắn mới nào, ẩn button
    if (newMessageIds.size <= 1) {
      // size sẽ là 1 trước khi delete, 0 sau khi delete
      setHasNewMessages(false)
    }
  }

  // Function để reset tất cả tin nhắn mới
  const clearAllNewMessages = () => {
    setNewMessageIds(new Set())
    setHasNewMessages(false)
    setNewMessageCount(0)
  }

  return {
    hasNewMessages,
    setHasNewMessages,
    newMessageCount,
    setNewMessageCount,
    highlightedMessage,
    setHighlightedMessage,
    messageRefs,
    latestMessagesLoaded,
    searchParams,
    setSearchParams,
    selected_message,
    // Các function mới để quản lý tin nhắn mới
    newMessageIds,
    addNewMessage,
    markMessageAsSeen,
    clearAllNewMessages
  }
}
