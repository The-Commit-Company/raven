import { UserContext } from '@/utils/auth/UserProvider'
import { useUpdateLastMessageDetails } from '@/utils/channel/ChannelListProvider'
import { useFrappeDocumentEventListener, useFrappeEventListener } from 'frappe-react-sdk'
import { useContext } from 'react'

export const useWebSocketEvents = (
  channelID: string,
  mutate: any,
  scrollToBottom: (behavior?: 'smooth' | 'auto') => void,
  setHasNewMessages: (hasNew: boolean) => void,
  setNewMessageCount: (count: number | ((prev: number) => number)) => void,
  // Thêm callback để track tin nhắn mới
  onNewMessageAdded?: (messageId: string) => void,
  isAtBottom?: boolean
) => {
  const { currentUser } = useContext(UserContext)
  const { updateLastMessageForChannel } = useUpdateLastMessageDetails()

  useFrappeDocumentEventListener('Raven Channel', channelID ?? '', () => {
    console.debug(`Raven Channel event received for channel: ${channelID}`)
  })

  useFrappeEventListener('message_created', (event) => {
    if (event.channel_id !== channelID) return

    mutate(
      (d: any) => {
        if (!d) return d

        const existingMessages = d.message.messages ?? []
        const newMessages = [...existingMessages]

        if (event.message_details) {
          const messageIndex = existingMessages.findIndex((msg: any) => msg.name === event.message_details.name)

          if (messageIndex !== -1) {
            newMessages[messageIndex] = event.message_details
          } else {
            newMessages.push(event.message_details)
          }
        }

        newMessages.sort((a: any, b: any) => new Date(b.creation).getTime() - new Date(a.creation).getTime())

        return {
          message: {
            messages: newMessages,
            has_old_messages: d.message.has_old_messages ?? false,
            has_new_messages: d.message.has_new_messages ?? false
          }
        }
      },
      { revalidate: false }
    ).then(() => {
      const isFromOtherUser = event.message_details?.owner !== currentUser

      if (!isFromOtherUser) {
        scrollToBottom('auto')
      }

      if (isFromOtherUser && !isAtBottom) {
        setNewMessageCount((count) => count + 1)
        setHasNewMessages(true)
        onNewMessageAdded?.(event.message_details.name)
      }
    })
  })

  // Message edited event
  useFrappeEventListener('message_edited', (event) => {
    mutate(
      (d: any) => {
        if (event.message_id && d) {
          const newMessages = d.message.messages?.map((message: any) => {
            if (message.name === event.message_id) {
              return { ...message, ...event.message_details }
            }
            return message
          })

          return {
            message: {
              messages: newMessages,
              has_old_messages: d.message.has_old_messages,
              has_new_messages: d.message.has_new_messages
            }
          }
        }
        return d
      },
      { revalidate: false }
    )
  })

  // Message deleted event
  useFrappeEventListener('message_deleted', (event) => {
    mutate(
      (d: any) => {
        if (d) {
          const newMessages = d.message.messages.filter((message: any) => message.name !== event.message_id)
          return {
            message: {
              messages: newMessages,
              has_old_messages: d.message.has_old_messages,
              has_new_messages: d.message.has_new_messages
            }
          }
        }
        return d
      },
      { revalidate: false }
    )
  })

  // Message reacted event
  useFrappeEventListener('message_reacted', (event) => {
    mutate(
      (d: any) => {
        if (event.message_id && d) {
          const newMessages = d.message.messages?.map((message: any) => {
            if (message.name === event.message_id) {
              return { ...message, message_reactions: event.reactions }
            }
            return message
          })

          return {
            message: {
              messages: newMessages,
              has_old_messages: d.message.has_old_messages,
              has_new_messages: d.message.has_new_messages
            }
          }
        }
        return d
      },
      { revalidate: false }
    )
  })

  // Message saved event
  useFrappeEventListener('message_saved', (event) => {
    mutate(
      (d: any) => {
        if (event.message_id && d) {
          const newMessages = d.message.messages?.map((message: any) => {
            if (message.name === event.message_id) {
              return { ...message, _liked_by: event.liked_by }
            }
            return message
          })

          return {
            message: {
              messages: newMessages,
              has_old_messages: d.message.has_old_messages,
              has_new_messages: d.message.has_new_messages
            }
          }
        }
        return d
      },
      { revalidate: false }
    )
  })

  // Message retracted
  useFrappeEventListener('raven_message_retracted', (event) => {
    mutate(
      (d: any) => {
        if (event.message_id && d) {
          const updatedMessages = d.message.messages?.map((message: any) => {
            if (message.name === event.message_id) {
              if (event.is_last_message) {
                updateLastMessageForChannel(message.channel_id, {
                  message_id: message.name,
                  content: 'Tin nhắn đã được thu hồi',
                  owner: currentUser,
                  message_type: message.message_type,
                  is_bot_message: message.is_bot_message,
                  bot: message.bot || null,
                  timestamp: new Date().toISOString()
                })
              }
              return { ...message, is_retracted: 1 }
            }
            return message
          })

          return {
            message: {
              messages: updatedMessages,
              has_old_messages: d.message.has_old_messages,
              has_new_messages: d.message.has_new_messages
            }
          }
        }
        return d
      },
      { revalidate: false }
    )
  })
}
