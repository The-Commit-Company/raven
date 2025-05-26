import throttle from '@/hooks/useThrottle'
import { MutableRefObject, useEffect } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

export const useScrollHandling = (
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  setNewMessageCount: (count: number) => void,
  setSearchParams: any,
  setHasNewMessages: (hasNew: boolean) => void,
  setShowScrollToBottomButton: (show: boolean) => void,
  unreadMessageIds: Set<string>,
  setUnreadMessageIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void,
  messageRefs: MutableRefObject<{ [key: string]: HTMLDivElement | null }>,
  isInitialLoadComplete: boolean = true // Thêm param để track initial load
) => {
  // Scroll event handling for Virtuoso
  useEffect(() => {
    const virtuoso = virtuosoRef.current
    if (!virtuoso) return

    const handleScroll = throttle(() => {
      // Không xử lý scroll events khi chưa hoàn thành initial load
      if (!isInitialLoadComplete) return

      // Use a small timeout to ensure the Virtuoso instance is ready
      setTimeout(() => {
        try {
          const scroller = document.querySelector('.virtuoso-scroller') as HTMLElement | null
          if (!scroller) return

          const { scrollTop, clientHeight, scrollHeight } = scroller
          const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

          if (isNearBottom) {
            setNewMessageCount(0)
            setSearchParams({})
            setHasNewMessages(false)
            setShowScrollToBottomButton(false)
          } else {
            setShowScrollToBottomButton(true)
          }
        } catch (e) {
          console.error('Error handling scroll:', e)
        }
      }, 100)
    }, 1000)

    // Listen to scroll events on the Virtuoso scroller
    const scroller = document.querySelector('.virtuoso-scroller') as HTMLElement | null
    if (!scroller) return

    scroller.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scroller.removeEventListener('scroll', handleScroll)
      handleScroll.cancel?.()
    }
  }, [isInitialLoadComplete]) // Thêm dependency

  // Intersection observer for unread messages
  useEffect(() => {
    // Không observe unread messages khi chưa hoàn thành initial load
    if (!isInitialLoadComplete) return

    // Find the Virtuoso scroller element
    const scroller = document.querySelector('.virtuoso-scroller') as HTMLElement | null
    if (!scroller) return

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
      { root: scroller, threshold: 0.5, rootMargin: '0px' }
    )

    const unreadIds = Array.from(unreadMessageIds)
    unreadIds.forEach((id) => {
      const element = messageRefs.current[id]
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [unreadMessageIds, isInitialLoadComplete]) // Thêm dependency
}