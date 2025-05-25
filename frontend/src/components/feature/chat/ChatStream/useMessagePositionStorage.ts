import { useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY_PREFIX = 'chat_message_position_'

const getStorageKey = (channelID: string) => `${STORAGE_KEY_PREFIX}${channelID}`

const saveMessagePosition = (channelID: string, messageName: string) => {
  try {
    localStorage.setItem(getStorageKey(channelID), messageName)
  } catch (error) {
    console.warn('Failed to save message position:', error)
  }
}

const getMessagePosition = (channelID: string): string | null => {
  try {
    return localStorage.getItem(getStorageKey(channelID))
  } catch (error) {
    console.warn('Failed to get message position:', error)
    return null
  }
}

const clearMessagePosition = (channelID: string) => {
  try {
    localStorage.removeItem(getStorageKey(channelID))
  } catch (error) {
    console.warn('Failed to clear message position:', error)
  }
}

interface UseMessagePositionStorageProps {
  channelID: string
  scrollRef: React.MutableRefObject<HTMLDivElement | null>
  messageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  messages: any
}

export const useMessagePositionStorage = ({
  channelID,
  scrollRef,
  messageRefs,
  messages
}: UseMessagePositionStorageProps) => {
  const isRestoringPosition = useRef(false)
  const lastSavedPosition = useRef<string | null>(null)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  // Khôi phục vị trí khi component mount hoặc khi messages thay đổi
  const restoreScrollPosition = useCallback(() => {
    if (!channelID || !scrollRef.current || !messages?.length || isRestoringPosition.current) {
      return
    }

    const savedMessageName = getMessagePosition(channelID)
    if (!savedMessageName) {
      return
    }

    const messageExists = messages.some((msg: any) => msg.name === savedMessageName)
    if (!messageExists) {
      clearMessagePosition(channelID)
      return
    }

    // Đợi DOM render hoàn toàn
    const timer = setTimeout(() => {
      const messageElement = messageRefs.current[savedMessageName]
      if (messageElement && scrollRef.current) {
        isRestoringPosition.current = true
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        setTimeout(() => {
          isRestoringPosition.current = false
        }, 1000)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [channelID, messages, messageRefs, scrollRef])

  // Lưu vị trí scroll hiện tại
  const saveCurrentScrollPosition = useCallback(() => {
    if (!channelID || !scrollRef.current || !messages?.length || isRestoringPosition.current) {
      return
    }

    const scrollContainer = scrollRef.current
    const scrollTop = scrollContainer.scrollTop
    const scrollHeight = scrollContainer.scrollHeight
    const clientHeight = scrollContainer.clientHeight

    // Chỉ lưu nếu không phải ở đầu hoặc cuối danh sách
    if (scrollTop <= 0 || scrollTop + clientHeight >= scrollHeight - 10) {
      return
    }

    // Tìm message gần nhất với vị trí scroll hiện tại
    let closestMessage: string | null = null
    let closestDistance = Infinity

    messages.forEach((message: any) => {
      if (message.message_type === 'date' || message.message_type === 'System') {
        return
      }

      const messageElement = messageRefs.current[message.name]
      if (messageElement) {
        const rect = messageElement.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()

        // Tính khoảng cách từ message đến trung tâm container
        const messageCenter = rect.top + rect.height / 2
        const containerCenter = containerRect.top + containerRect.height / 2
        const distance = Math.abs(messageCenter - containerCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestMessage = message.name
        }
      }
    })

    // Lưu vị trí nếu tìm thấy message gần nhất và khác với vị trí đã lưu
    if (closestMessage && closestMessage !== lastSavedPosition.current) {
      saveMessagePosition(channelID, closestMessage)
      lastSavedPosition.current = closestMessage
    }
  }, [channelID, messages, messageRefs, scrollRef])

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    scrollTimeout.current = setTimeout(() => {
      saveCurrentScrollPosition()
    }, 300) // Debounce 300ms
  }, [saveCurrentScrollPosition])

  // Effect để khôi phục vị trí
  useEffect(() => {
    restoreScrollPosition()
  }, [restoreScrollPosition])

  // Effect để thêm scroll listener
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [handleScroll, scrollRef])

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  const clearSavedPosition = useCallback(() => {
    clearMessagePosition(channelID)
    lastSavedPosition.current = null
  }, [channelID])

  const getSavedPosition = useCallback(() => {
    return getMessagePosition(channelID)
  }, [channelID])

  const saveSpecificPosition = useCallback(
    (messageName: string) => {
      saveMessagePosition(channelID, messageName)
      lastSavedPosition.current = messageName
    },
    [channelID]
  )

  return {
    clearSavedPosition,
    getSavedPosition,
    saveSpecificPosition,
    restoreScrollPosition
  }
}
