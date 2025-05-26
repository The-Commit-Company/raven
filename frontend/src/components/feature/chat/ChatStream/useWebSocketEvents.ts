// useWebSocketEvents.ts - WebSocket events handler for Virtuoso
import { UserContext } from '@/utils/auth/UserProvider'
import { useFrappeDocumentEventListener, useFrappeEventListener } from 'frappe-react-sdk'
import { MutableRefObject, useContext } from 'react'
import { VirtuosoHandle } from 'react-virtuoso'

export const useWebSocketEvents = (
  channelID: string,
  mutate: any,
  virtuosoRef: MutableRefObject<VirtuosoHandle | null>,
  scrollToBottom: (behavior?: 'smooth' | 'auto') => void,
  setHasNewMessages: (hasNew: boolean) => void,
  setNewMessageCount: (count: number | ((prev: number) => number)) => void,
  setUnreadMessageIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void
) => {
  const { currentUser } = useContext(UserContext)

  useFrappeDocumentEventListener('Raven Channel', channelID ?? '', () => {})

  // Message created event
  useFrappeEventListener('message_created', (event) => {
    if (event.channel_id !== channelID) return

    mutate(
      (d: any) => {
        if (!d || d.message.has_new_messages !== false) return d

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

        // Handle unread messages for Virtuoso
        const isFromOtherUser = event.message_details?.owner !== currentUser
        let isNearBottom = false

        // Check if user is near bottom using Virtuoso's state
        if (virtuosoRef.current) {
          // We'll assume if we can't determine scroll position, user is not at bottom
          // This is a safe assumption for new message handling
          isNearBottom = false // You might need to track this via Virtuoso callbacks
        }

        if (isFromOtherUser && !isNearBottom) {
          setNewMessageCount((count) => count + 1)
          setUnreadMessageIds((prev) => {
            const newSet = new Set(prev)
            newSet.add(event.message_details.name)
            setNewMessageCount(newSet.size)
            return newSet
          })
          setHasNewMessages(true)
        }

        return {
          message: {
            messages: newMessages,
            has_old_messages: d.message.has_old_messages ?? false,
            has_new_messages: false
          }
        }
      },
      { revalidate: false }
    ).then(() => {
      const isFromOtherUser = event.message_details?.owner !== currentUser

      // For messages from current user, always scroll to bottom
      if (!isFromOtherUser) {
        scrollToBottom('smooth')
      }
    })
  })

  // Message edited event
  useFrappeEventListener('message_edited', (event) => {
    mutate(
      (d: any) => {
        if (event.message_id && d) {
          const newMessages = d.message.messages.map((message: any) => {
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
          const newMessages = d.message.messages.map((message: any) => {
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
          const newMessages = d.message.messages.map((message: any) => {
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
}
