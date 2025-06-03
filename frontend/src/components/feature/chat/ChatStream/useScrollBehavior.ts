// useScrollBehavior.ts - Virtuoso specific scroll behavior
import { MutableRefObject, useCallback } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

export const useScrollBehavior = (virtuosoRef: MutableRefObject<VirtuosoHandle | null>) => {
  const scrollToBottom = useCallback(
    (behavior: 'smooth' | 'auto' = 'auto') => {
      if (!virtuosoRef.current) return

      if (behavior === 'smooth') {
        virtuosoRef.current.scrollToIndex({
          index: 'LAST',
          behavior: 'smooth'
        })
      } else {
        virtuosoRef.current.scrollToIndex({
          index: 'LAST',
          behavior: 'auto'
        })
      }
    },
    [virtuosoRef]
  )

  const scrollToMessage = useCallback(
    (messageID: string, messages: any[]) => {
      if (!virtuosoRef.current || !messages) return

      const messageIndex = messages.findIndex((message) => message.name === messageID)

      if (messageIndex !== -1) {
        virtuosoRef.current.scrollToIndex({
          index: messageIndex,
          behavior: 'smooth',
          align: 'center'
        })
      }
    },
    [virtuosoRef]
  )

  const scrollToIndex = useCallback(
    (index: number, behavior: 'smooth' | 'auto' = 'smooth') => {
      if (!virtuosoRef.current) return

      virtuosoRef.current.scrollToIndex({
        index,
        behavior,
        align: 'start'
      })
    },
    [virtuosoRef]
  )

  return {
    scrollToBottom,
    scrollToMessage,
    scrollToIndex
  }
}
