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

    const rawMessages = (data?.message?.messages || []).filter((msg: any) => !!msg && !!msg.creation)

    const messagesWithDateSeparators: MessageDateBlock[] = []

    if (rawMessages?.length === 0) return []

    const lastMessage = rawMessages[rawMessages.length - 1]
    let currentDate = lastMessage.creation?.split?.(' ')[0] || ''
    let currentDateTime = new Date(lastMessage.creation?.split?.('.')[0] || '').getTime()

    messagesWithDateSeparators.push({
      creation: getDateObject(`${currentDate} 00:00:00`).format('Do MMMM YYYY'),
      message_type: 'date',
      name: currentDate
    })

    messagesWithDateSeparators.push({
      ...lastMessage,
      is_continuation: 0,
      is_pinned: pinnedMessageIDs.includes(lastMessage.name) ? 1 : 0
    })

    for (let i = rawMessages?.length - 2; i >= 0; i--) {
      const message = rawMessages[i]
      const messageDate = message.creation?.split?.(' ')[0] || ''
      const messageDateTime = new Date(message.creation?.split?.('.')[0] || '').getTime()

      if (messageDate !== currentDate) {
        messagesWithDateSeparators.push({
          creation: getDateObject(`${messageDate} 00:00:00`).format('Do MMMM YYYY'),
          message_type: 'date',
          name: messageDate
        })
      }

      const currentMessageSender = message.is_bot_message ? message.bot : message.owner
      const nextMessage = rawMessages[i + 1]
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
      currentDateTime = new Date(message.creation || '').getTime()
    }

    return messagesWithDateSeparators
  }, [data, pinnedMessagesString])

  return messages
}
