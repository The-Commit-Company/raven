import { getDateObject } from '@/utils/dateConversions/utils'
import { useMemo } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'

type MessageDateBlock =
  | Message
  | {
      creation: string
      message_type: 'date'
      name: string
    }

export const useMessageProcessing = (data: any, pinnedMessagesString?: string) => {
  const messages = useMemo(() => {
    if (!data) return undefined

    let pinnedMessageIDs = pinnedMessagesString?.split('\n') ?? []
    pinnedMessageIDs = pinnedMessageIDs?.map((messageID) => messageID.trim())

    const messages = [...data.message.messages]
    const messagesWithDateSeparators: MessageDateBlock[] = []

    if (messages?.length === 0) return []

    let currentDate = messages[messages?.length - 1].creation.split(' ')[0]
    let currentDateTime = new Date(messages[messages?.length - 1].creation.split('.')[0]).getTime()

    // Add first date separator
    messagesWithDateSeparators.push({
      creation: getDateObject(`${currentDate} 00:00:00`).format('Do MMMM YYYY'),
      message_type: 'date',
      name: currentDate
    })

    messagesWithDateSeparators.push({
      ...messages[messages?.length - 1],
      is_continuation: 0,
      is_pinned: pinnedMessageIDs.includes(messages[messages?.length - 1].name) ? 1 : 0
    })

    // Process remaining messages
    for (let i = messages?.length - 2; i >= 0; i--) {
      const message = messages[i]
      const messageDate = message.creation.split(' ')[0]
      const messageDateTime = new Date(message.creation.split('.')[0]).getTime()

      // Add date separator if date changes
      if (messageDate !== currentDate) {
        messagesWithDateSeparators.push({
          creation: getDateObject(`${messageDate} 00:00:00`).format('Do MMMM YYYY'),
          message_type: 'date',
          name: messageDate
        })
      }

      const currentMessageSender = message.is_bot_message ? message.bot : message.owner
      const nextMessage = messages[i + 1]
      const nextMessageSender =
        nextMessage.message_type === 'System' ? null : nextMessage.is_bot_message ? nextMessage.bot : nextMessage.owner

      const is_continuation =
        currentMessageSender === nextMessageSender && messageDateTime - currentDateTime <= 120000 ? 1 : 0

      messagesWithDateSeparators.push({
        ...message,
        is_continuation,
        is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0
      })

      currentDate = messageDate
      currentDateTime = new Date(message.creation).getTime()
    }

    return messagesWithDateSeparators
  }, [data, pinnedMessagesString])

  return messages
}
