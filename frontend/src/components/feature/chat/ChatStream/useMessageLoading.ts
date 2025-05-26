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
      const scrollContainer = virtuosoRef.current
      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollToIndex({
            index: 0,
            behavior: 'smooth'
          })
        }
      })
    })
  }

  const loadNewerMessages = () => {
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
