import { LegendListRef } from '@legendapp/list'
import { Message } from '@raven/types/common/Message'
import { SiteContext } from 'app/[site_id]/_layout'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useMemo } from 'react'
import dayjs from 'dayjs'

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)

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
    name: string,
    formattedDate: string
}

export type MessageDateBlock = Message | DateBlock

const useChatStream = (channelID: string, listRef: React.RefObject<LegendListRef>) => {

    const siteInformation = useContext(SiteContext)

    const SYSTEM_TIMEZONE = siteInformation?.system_timezone ?? 'Asia/Kolkata'

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

            // For date separators, we need to format the date in the following way:
            // If the date is today, return "Today"
            // If the date is yesterday, return "Yesterday"
            // Otherwise, return the date in the format "MMM Do" if the date is within the current year
            // Otherwise, return the date in the format "MMM Do, YYYY"
            const parsedDate = dayjs.tz(currentDate, SYSTEM_TIMEZONE).local()
            const today = dayjs()
            const yesterday = dayjs().subtract(1, 'day')

            let formattedDateString = ""

            if (parsedDate.isSame(today, 'date')) {
                formattedDateString = "Today"
            } else if (parsedDate.isSame(yesterday, 'date')) {
                formattedDateString = "Yesterday"
            } else if (parsedDate.isSame(today, 'year')) {
                formattedDateString = parsedDate.format('MMM Do')
            } else {
                formattedDateString = parsedDate.format('MMM Do, YYYY')
            }

            messagesWithDateSeparators.push({
                creation: currentDate,
                formattedDate: formattedDateString,
                message_type: 'date',
                name: currentDate
            })

            messagesWithDateSeparators.push({
                ...messages[messages.length - 1],
                formattedTime: dayjs.tz(messages[messages.length - 1].creation, SYSTEM_TIMEZONE).local().format('hh:mm A'),
                is_continuation: 0
            })

            // Loop through the messages and add date separators if the date changes
            for (let i = messages.length - 2; i >= 0; i--) {
                const message = messages[i]
                const messageDate = message.creation.split(' ')[0]
                let messageDateTime = new Date(message.creation.split('.')[0]).getTime()
                const formattedMessageTime = dayjs.tz(message.creation, SYSTEM_TIMEZONE).local().format('hh:mm A')

                if (messageDate !== currentDate) {

                    const messageDateObject = dayjs.tz(messageDate, SYSTEM_TIMEZONE).local()
                    let formattedDateString = ""

                    if (messageDateObject.isSame(today, 'date')) {
                        formattedDateString = "Today"
                    } else if (messageDateObject.isSame(yesterday, 'date')) {
                        formattedDateString = "Yesterday"
                    } else if (messageDateObject.isSame(today, 'year')) {
                        formattedDateString = messageDateObject.format('MMM Do')
                    } else {
                        formattedDateString = messageDateObject.format('MMM Do, YYYY')
                    }

                    messagesWithDateSeparators.push({
                        creation: messageDate,
                        formattedDate: formattedDateString,
                        message_type: 'date',
                        name: messageDate
                    })
                }

                const currentMessageSender = message.is_bot_message ? message.bot : message.owner

                const nextMessage = messages[i + 1]
                const nextMessageSender = nextMessage.message_type === "System" ? null : nextMessage.is_bot_message ? nextMessage.bot : nextMessage.owner

                if (nextMessageSender !== currentMessageSender) {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 0, formattedTime: formattedMessageTime })
                } else if (messageDateTime - currentDateTime > 120000) {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 0, formattedTime: formattedMessageTime })
                } else {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 1, formattedTime: formattedMessageTime })
                }

                currentDate = messageDate
                currentDateTime = new Date(message.creation).getTime()
            }

            return messagesWithDateSeparators
        }
        else {
            return []
        }



    }, [data, SYSTEM_TIMEZONE])

    return {
        data: messages,
        isLoading,
        error,
        mutate
    }



}

export default useChatStream