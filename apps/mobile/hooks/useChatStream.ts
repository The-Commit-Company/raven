import { LegendListRef } from '@legendapp/list'
import { Message } from '@raven/types/common/Message'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { formatDate } from '@raven/lib/utils/dateConversions'
import useSiteContext from './useSiteContext'
import { GetMessagesResponse } from '@raven/types/common/ChatStream'

dayjs.extend(utc)
dayjs.extend(advancedFormat)

//regex to check if the text contains an <a></a> tag
const LINK_PREVIEW_REGEX = /<a\b[^>]*>(.*?)<\/a>/

const checkIfMessageContainsLinkPreview = (message: Message) => {
    if (message.text && message.hide_link_preview === 0) {
        return LINK_PREVIEW_REGEX.test(message.text)
    }
    return false
}

export interface DateBlock {
    creation: string
    message_type: 'date',
    name: string,
    formattedDate: string
}

export interface HeaderBlock {
    message_type: 'header',
    name: string
}

export type MessageDateBlock = Message | DateBlock | HeaderBlock

const useChatStream = (channelID: string, listRef: React.RefObject<LegendListRef>) => {

    const siteInformation = useSiteContext()

    /**
     * Ensures scroll to bottom happens after all content is loaded
     * Uses both RAF and a backup timeout for reliability
     */
    const scrollToBottom = (index: number, animated: boolean = false) => {
        if (!listRef.current) return

        listRef.current.scrollToIndex({
            index
        })

        // // First immediate scroll attempt
        requestAnimationFrame(() => {
            if (listRef.current) {
                listRef.current.scrollToIndex({
                    index,
                    animated
                })
            }
        })

        // Second attempt after a short delay
        const shortDelayTimer = setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollToIndex({
                    index,
                    animated
                })
            }
        }, 100)

        // Final backup attempt after longer delay
        const backupTimer = setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollToIndex({
                    index,
                    animated
                })
            }
        }, 500)

        return () => {
            clearTimeout(shortDelayTimer)
            clearTimeout(backupTimer)
        }
    }

    const SYSTEM_TIMEZONE = siteInformation?.system_timezone ? siteInformation.system_timezone : 'Asia/Kolkata'

    const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        channel_id: channelID,
        limit: 20

        // TODO: Add base message
    }, { path: `get_messages_for_channel_${channelID}` }, {
        onSuccess: (data) => {

            const index = data.message.messages.length > 0 ? data.message.messages.length - 1 : 0

            let cleanup = scrollToBottom(index, false)

            if (cleanup) {
                cleanup()
            }
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

        if (!data.message.has_old_messages || messages.length === 0) {
            messagesWithDateSeparators.push({
                message_type: 'header',
                name: channelID,
            })
        }

        if (messages.length > 0) {
            let currentDate = messages[messages.length - 1].creation.split(' ')[0]
            let currentDateTime = new Date(messages[messages.length - 1].creation.split('.')[0]).getTime()

            messagesWithDateSeparators.push({
                creation: currentDate,
                formattedDate: formatDate(currentDate),
                message_type: 'date',
                name: currentDate
            })

            const lastMessage = messages[messages.length - 1]

            messagesWithDateSeparators.push({
                ...lastMessage,
                might_contain_link_preview: checkIfMessageContainsLinkPreview(lastMessage),
                formattedTime: dayjs(lastMessage.creation).local().format('hh:mm A'),
                is_continuation: 0
            })

            // Loop through the messages and add date separators if the date changes
            for (let i = messages.length - 2; i >= 0; i--) {
                const message = messages[i]
                const messageDate = message.creation.split(' ')[0]
                let messageDateTime = new Date(message.creation.split('.')[0]).getTime()
                const formattedMessageTime = dayjs(message.creation).local().format('hh:mm A')
                const might_contain_link_preview = checkIfMessageContainsLinkPreview(message)

                if (messageDate !== currentDate) {
                    messagesWithDateSeparators.push({
                        creation: messageDate,
                        formattedDate: formatDate(messageDate),
                        message_type: 'date',
                        name: messageDate
                    })
                }

                const currentMessageSender = message.is_bot_message ? message.bot : message.owner

                const nextMessage = messages[i + 1]
                const nextMessageSender = nextMessage.message_type === "System" ? null : nextMessage.is_bot_message ? nextMessage.bot : nextMessage.owner

                if (nextMessageSender !== currentMessageSender) {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 0, formattedTime: formattedMessageTime, might_contain_link_preview })
                } else if (messageDateTime - currentDateTime > 120000) {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 0, formattedTime: formattedMessageTime, might_contain_link_preview })
                } else {
                    messagesWithDateSeparators.push({ ...message, is_continuation: 1, formattedTime: formattedMessageTime, might_contain_link_preview })
                }

                currentDate = messageDate
                currentDateTime = new Date(message.creation).getTime()
            }

            return messagesWithDateSeparators
        }
        else {
            return messagesWithDateSeparators
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