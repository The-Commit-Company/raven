import { MutableRefObject, useEffect } from 'react'

export const useScrollToBottomEffect = (scrollRef: MutableRefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    if (!scrollRef.current) return

    const observer = new ResizeObserver(() => {
      const scrollContainer = scrollRef.current
      if (!scrollContainer) return

      // Kiểm tra xem có đang ở gần cuối không trước khi điều chỉnh cuộn
      if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100) {
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'instant'
          })
        })
      }
    })

    observer.observe(scrollRef.current)

    return () => {
      observer.disconnect()
    }
  }, [scrollRef])
}
