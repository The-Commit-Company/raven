import { MutableRefObject } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'
import { Message } from '../../../../../../types/Messaging/Message'

export const useMessageLoading = (
  data: any,
  mutate: any,
  fetchOlderMessages: any,
  fetchNewerMessages: any,
  loadingOlderMessages: boolean,
  loadingNewerMessages: boolean,
  channelID: string,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  highlightedMessage: string | null,
  scrollToBottom: (behavior?: 'auto' | 'smooth') => void,
  latestMessagesLoadedRef: MutableRefObject<boolean>,
  isInitialLoadComplete: boolean = true // Thêm param để kiểm tra initial load
) => {
  const loadOlderMessages = () => {
    // Thêm điều kiện kiểm tra initial load complete
    if (loadingOlderMessages || !data?.message.has_old_messages || !isInitialLoadComplete) {
      return Promise.resolve()
    }

    if (!virtuosoRef.current) return Promise.resolve()

    let previousScrollTop = 0

    // Try to get current scroll state from Virtuoso using its public API
    try {
      // Use the scrollTo method to get the current scroll position
      // This is a workaround since getState() requires a callback
      const scrollContainer = document.querySelector('.virtuoso-scroller') as HTMLElement | null
      if (scrollContainer) {
        previousScrollTop = scrollContainer.scrollTop || 0
      }
    } catch (e) {
      console.error('Error getting scroll position:', e)
    }

    return mutate(
      (d: any) => {
        let oldestMessage: Message | null = null
        if (d && d.message.messages.length > 0) {
          if (d.message.has_old_messages) {
            oldestMessage = d.message.messages[d.message.messages.length - 1]

            if (oldestMessage) {
              return fetchOlderMessages({
                channel_id: channelID,
                from_message: oldestMessage.name
              })
                .then((res: any) => {
                  const mergedMessages = [...d.message.messages, ...(res?.message.messages ?? [])]

                  return {
                    message: {
                      messages: mergedMessages,
                      has_old_messages: res?.message.has_old_messages ?? false,
                      has_new_messages: d?.message.has_new_messages ?? false
                    }
                  }
                })
                .catch(() => d)
            }
          }
        }
        return d
      },
      { revalidate: false }
    ).then(() => {
      // After messages are loaded, scroll to maintain position
      if (virtuosoRef.current && isInitialLoadComplete) {
        // Use scrollTo with the previous scroll position
        // Virtuoso will handle the rest with its internal state
        const targetPosition = Math.max(0, previousScrollTop)

        // Use a small timeout to ensure the DOM has updated
        setTimeout(() => {
          if (virtuosoRef.current) {
            try {
              virtuosoRef.current.scrollTo({
                top: targetPosition,
                behavior: 'auto'
              })
            } catch (e) {
              console.error('Error scrolling Virtuoso:', e)
              // Fallback to scroll to bottom chỉ khi cần thiết
              if (!isInitialLoadComplete) {
                scrollToBottom('auto')
              }
            }
          }
        }, 50)
      }
    })
  }

  const loadNewerMessages = () => {
    // Thêm điều kiện kiểm tra initial load complete
    if (loadingNewerMessages || !data?.message.has_new_messages || highlightedMessage || !isInitialLoadComplete) {
      return Promise.resolve()
    }

    mutate(
      (d: any) => {
        let newestMessage: Message | null = null
        if (d && d.message.messages.length > 0) {
          if (d.message.has_new_messages) {
            newestMessage = d.message.messages[0]

            if (newestMessage) {
              return fetchNewerMessages({
                channel_id: channelID,
                from_message: newestMessage.name,
                limit: 10
              })
                .then((res: any) => {
                  const mergedMessages = [...(res?.message.messages ?? []), ...d.message.messages]

                  return {
                    message: {
                      messages: mergedMessages,
                      has_old_messages: d?.message.has_old_messages ?? false,
                      has_new_messages: res?.message.has_new_messages ?? false
                    }
                  }
                })
                .catch(() => d)
            }
          }
        }
        return d
      },
      { revalidate: false }
    ).then((res: any) => {
      if (res?.message.has_new_messages === false && isInitialLoadComplete) {
        latestMessagesLoadedRef.current = true
        scrollToBottom('smooth')
      }
    })
  }

  return { loadOlderMessages, loadNewerMessages }
}