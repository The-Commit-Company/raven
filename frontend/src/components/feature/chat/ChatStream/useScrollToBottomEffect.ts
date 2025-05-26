import { MutableRefObject, useEffect } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

export const useScrollToBottomEffect = (virtuosoRef: MutableRefObject<VirtuosoHandle | null>) => {
  useEffect(() => {
    if (!virtuosoRef.current) return

    const handleResize = () => {
      const scroller = document.querySelector('.virtuoso-scroller') as HTMLElement | null
      if (!scroller) return

      // Check if we're near the bottom before auto-scrolling
      const isNearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 100

      if (isNearBottom && virtuosoRef.current) {
        requestAnimationFrame(() => {
          try {
            virtuosoRef.current?.scrollTo({
              top: scroller.scrollHeight,
              behavior: 'auto'
            })
          } catch (e) {
            console.error('Error scrolling to bottom:', e)
          }
        })
      }
    }

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(handleResize)
    const scroller = document.querySelector('.virtuoso-scroller')

    if (scroller) {
      resizeObserver.observe(scroller)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [virtuosoRef])
}
