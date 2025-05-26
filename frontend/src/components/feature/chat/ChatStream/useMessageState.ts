import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useMessageState = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected_message = searchParams.get('message_id')

  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [unreadMessageIds, setUnreadMessageIds] = useState<Set<string>>(new Set())
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [highlightedMessage, setHighlightedMessage] = useState<string | null>(
    selected_message ? selected_message : null
  )

  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const latestMessagesLoaded = useRef(false)

  return {
    hasNewMessages,
    setHasNewMessages,
    unreadMessageIds,
    setUnreadMessageIds,
    newMessageCount,
    setNewMessageCount,
    highlightedMessage,
    setHighlightedMessage,
    messageRefs,
    latestMessagesLoaded,
    searchParams,
    setSearchParams,
    selected_message
  }
}
