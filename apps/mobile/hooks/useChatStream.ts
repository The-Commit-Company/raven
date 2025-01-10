import { LegendListRef } from '@legendapp/list'
import { Message } from '@raven/types/common/Message'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useMemo } from 'react'
import { FlatList } from 'react-native'

interface GetMessagesResponse {
    message: {
        messages: Message[],
        has_old_messages: boolean
        has_new_messages: boolean
    }
}

export interface DateBlock {
    creation: string
    message_type: 'date',
    name: string
}

export type MessageDateBlock = Message | DateBlock

const useChatStream = (channelID: string, listRef: React.RefObject<LegendListRef>) => {

    const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        channel_id: channelID,
        limit: 20

        // TODO: Add base message
    }, undefined, {
        onSuccess: () => {
            // listRef.current?.scrollToEnd({ animated: false })

            // setTimeout(() => {
            //     listRef.current?.scrollToEnd({ animated: false })
            // }, 100)
        }
    })

    // TODO: Add websocket connection and message parsing


    const messages = useMemo(() => {

        if (!data) return []

        // Loop through the messages array and add a date block before each date change
        // Also format the date to be displayed in the chat interface

        // Messages are already sorted by date - from latest to oldest
        // Date separator is added whenever the date changes
        // Add `is_continuation` to the messages that are only apart by 2 minutes
        const messages = [...data.message.messages]

        const messagesWithDateSeparators: MessageDateBlock[] = []

        if (messages.length > 0) {
            let currentDate = messages[messages.length - 1].creation.split(' ')[0]
            let currentDateTime = new Date(messages[messages.length - 1].creation.split('.')[0]).getTime()

            messagesWithDateSeparators.push({
                // TODO: Format the date
                creation: currentDate,
                message_type: 'date',
                name: currentDate
            })

            messagesWithDateSeparators.push({ ...messages[messages.length - 1], is_continuation: 0 })

            // Loop through the messages and add date separators if the date changes
            for (let i = messages.length - 2; i >= 0; i--) {
                const message = messages[i]
                const messageDate = message.creation.split(' ')[0]
                let messageDateTime = new Date(message.creation.split('.')[0]).getTime()

                if (messageDate !== currentDate) {
                    messagesWithDateSeparators.push({
                        // TODO: Format the date
                        creation: messageDate,
                        message_type: 'date',
                        name: messageDate
                    })
                }

                const currentMessageSender = message.is_bot_message ? message.bot : message.owner

                const nextMessage = messages[i + 1]
                const nextMessageSender = nextMessage.message_type === "System" ? null : nextMessage.is_bot_message ? nextMessage.bot : nextMessage.owner

                if (nextMessageSender !== currentMessageSender) {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 0 })
                } else if (messageDateTime - currentDateTime > 120000) {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 0 })
                } else {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 1 })
                }

                currentDate = messageDate
                currentDateTime = new Date(message.creation).getTime()
            }

            return messagesWithDateSeparators
        }
        else {
            return []
        }



    }, [data])

    return {
        data: messages,
        isLoading,
        error,
        mutate
    }



}

export default useChatStream