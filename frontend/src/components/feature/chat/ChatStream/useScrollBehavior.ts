import { MutableRefObject, useCallback } from 'react'

export const useScrollBehavior = (scrollRef: MutableRefObject<HTMLDivElement | null>) => {
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      if (!scrollRef.current) return

      const performScroll = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior
          })
        }
      }

      // Triple attempt for reliability
      requestAnimationFrame(performScroll)
      setTimeout(performScroll, 100)
      setTimeout(performScroll, 500)
    },
    [scrollRef]
  )

  const scrollToMessage = useCallback((messageID: string, behavior: ScrollBehavior = 'smooth') => {
    const performScroll = () => {
      document.getElementById(`message-${messageID}`)?.scrollIntoView({
        behavior,
        block: 'center'
      })
    }

    requestAnimationFrame(performScroll)
    setTimeout(performScroll, 100)
    setTimeout(performScroll, 250)
  }, [])

  return { scrollToBottom, scrollToMessage }
}
