import throttle from '@/hooks/useThrottle'
import { MutableRefObject, useEffect } from 'react'

export const useScrollHandling = (
  scrollRef: MutableRefObject<HTMLDivElement | null>,
  setNewMessageCount: (count: number) => void,
  setSearchParams: any,
  setHasNewMessages: (hasNew: boolean) => void,
  setShowScrollToBottomButton: (show: boolean) => void,
  unreadMessageIds: Set<string>,
  setUnreadMessageIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void,
  messageRefs: MutableRefObject<{ [key: string]: HTMLDivElement | null }>
) => {
  // Scroll event handling
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = throttle(() => {
      const { scrollTop, clientHeight, scrollHeight } = el
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom) {
        setNewMessageCount(0)
        setSearchParams({})
        setHasNewMessages(false)
        setShowScrollToBottomButton(false)
      } else {
        setShowScrollToBottomButton(true)
      }
    }, 1000)

    el.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      el.removeEventListener('scroll', handleScroll)
      handleScroll.cancel?.()
    }
  }, [])

  // Intersection observer for unread messages
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const idsToRemove = new Set()
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.id.replace('message-', '')
            if (unreadMessageIds.has(messageId)) {
              idsToRemove.add(messageId)
              observer.unobserve(entry.target)
            }
          }
        })

        if (idsToRemove.size > 0) {
          setUnreadMessageIds((prev) => {
            const newSet = new Set(prev)
            idsToRemove.forEach((id: any) => newSet.delete(id))
            setNewMessageCount(newSet.size)
            return newSet
          })
        }
      },
      { root: el, threshold: 0.5, rootMargin: '0px' }
    )

    const unreadIds = Array.from(unreadMessageIds)
    unreadIds.forEach((id) => {
      const element = messageRefs.current[id]
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [unreadMessageIds])
}
