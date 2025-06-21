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
  latestMessagesLoadedRef: MutableRefObject<boolean>
) => {
  const loadOlderMessages = () => {
    if (loadingOlderMessages || !data?.message.has_old_messages) {
      return Promise.resolve()
    }

    if (!virtuosoRef.current) {
      return Promise.resolve()
    }

    return mutate(
      (d: any) => {
        let oldestMessage: Message | null = null
        if (d && d.message.messages?.length > 0) {
          if (d.message.has_old_messages) {
            oldestMessage = d.message.messages[d.message.messages?.length - 1]

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
                .catch(() => {
                  return d
                })
            }
          }
        }
        return d
      },
      { revalidate: false }
    ).then(() => {
      if (!highlightedMessage && virtuosoRef.current) {
        requestAnimationFrame(() => {
          if (virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
              index: 5,
              behavior: 'auto'
            })
          }
        })
      }
    })
  }

  const loadNewerMessages = () => {
    if (loadingNewerMessages || !data?.message.has_new_messages) {
      return Promise.resolve()
    }

    return mutate(
      (d: any) => {
        let newestMessage: Message | null = null
        if (d && d.message.messages?.length > 0) {
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
                .catch(() => {
                  return d
                })
            }
          }
        }
        return d
      },
      { revalidate: false }
    ).then((res: any) => {
      if (res?.message.has_new_messages === false) {
        latestMessagesLoadedRef.current = true

        if (!highlightedMessage) {
          requestAnimationFrame(() => {
            scrollToBottom('auto')
          })
        }
      }
    })
  }

  return { loadOlderMessages, loadNewerMessages }
}
