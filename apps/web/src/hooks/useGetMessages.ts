import { GetMessagesResponse } from '@raven/types/common/ChatStream'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useIsMobile } from './use-mobile'
import { Message } from '@raven/types/common/Message'
import { getDateObject } from '@utils/date'

type MessageDateBlock = Message | {
    /**  */
    creation: string
    message_type: 'date',
    name: string
}

export const useGetMessages = (channelID: string) => {

    const isMobile = useIsMobile()

    const { data, isLoading, error } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        'channel_id': channelID,
        // 'base_message': selected_message ? selected_message : undefined
    }, {
        revalidateOnFocus: isMobile ? true : false,
    })

    return {
        data: data?.message,
        isLoading,
        error
    }
}

export const formatMessages = (messages: Message[], pinnedMessagesString: string = '') => {

    // Loop through the messages array and add a date block before each date change
    // Also format the date to be displayed in the chat interface

    let pinnedMessageIDs = pinnedMessagesString?.split('\n') ?? []
    pinnedMessageIDs = pinnedMessageIDs.map(messageID => messageID.trim())

    // Messages are already sorted by date - from latest to oldest
    // Date separator is added whenever the date changes
    // Add date separators

    // Add `is_continuation` to the messages that are only apart by 2 minutes
    const messagesWithDateSeparators: MessageDateBlock[] = []
    if (messages.length > 0) {
        let currentDate = messages[messages.length - 1].creation.split(' ')[0]
        let currentDateTime = new Date(messages[messages.length - 1].creation.split('.')[0]).getTime()

        // Do not add the date separator to the oldest message since we don't know if it's the first message of the day
        messagesWithDateSeparators.push({
            creation: getDateObject(`${currentDate} 00:00:00`).format('Do MMMM YYYY'),
            message_type: 'date',
            name: currentDate
        })

        messagesWithDateSeparators.push({
            ...messages[messages.length - 1],
            is_continuation: 0,
            is_pinned: pinnedMessageIDs.includes(messages[messages.length - 1].name) ? 1 : 0
        })
        // Loop through the messages and add date separators if the date changes
        for (let i = messages.length - 2; i >= 0; i--) {

            const message = messages[i]
            const messageDate = message.creation.split(' ')[0]
            let messageDateTime = new Date(message.creation.split('.')[0]).getTime()

            if (messageDate !== currentDate) {
                messagesWithDateSeparators.push({
                    creation: getDateObject(`${messageDate} 00:00:00`).format('Do MMMM YYYY'),
                    message_type: 'date',
                    name: messageDate
                })
            }

            const currentMessageSender = message.is_bot_message ? message.bot : message.owner

            const nextMessage = messages[i + 1]
            const nextMessageSender = nextMessage.message_type === "System" ? null : nextMessage.is_bot_message ? nextMessage.bot : nextMessage.owner

            if (currentMessageSender !== nextMessageSender) {
                messagesWithDateSeparators.push({
                    ...message,
                    is_continuation: 0,
                    is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0
                })
            } else if (messageDateTime - currentDateTime > 120000) {
                messagesWithDateSeparators.push({
                    ...message,
                    is_continuation: 0,
                    is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0
                })
            } else {
                messagesWithDateSeparators.push({ ...message, is_continuation: 1, is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0 })
            }
            currentDate = messageDate
            currentDateTime = new Date(message.creation).getTime()
        }

        return messagesWithDateSeparators
    }
    else {
        return []
    }
}