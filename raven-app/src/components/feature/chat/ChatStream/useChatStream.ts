import { useFrappeDocumentEventListener, useFrappeEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { MutableRefObject, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Message } from '../../../../../../types/Messaging/Message'
import { convertFrappeTimestampToUserTimezone } from '@/utils/dateConversions/utils'

interface GetMessagesResponse {
    message: {
        messages: Message[],
        has_old_messages: boolean
        has_new_messages: boolean
    }
}

type MessageDateBlock = Message | {
    /**  */
    creation: string
    message_type: 'date',
    name: string
}
/**
 * Hook to fetch messages to be rendered on the chat interface
 */
const useChatStream = (scrollRef: MutableRefObject<HTMLDivElement | null>) => {

    const { channelID } = useParams()

    const [baseMessage, setBaseMessage] = useState<string | undefined>()

    const { call, loading: loadingOlderMessages } = useFrappePostCall('raven.api.chat_stream.get_older_messages')

    const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        'channel_id': channelID,
        'base_message': baseMessage
    }, baseMessage ? `get_messages_for_channel_${channelID}_${baseMessage}` : `get_messages_for_channel_${channelID}`, {
        revalidateOnFocus: false,
        onSuccess: () => {
            scrollRef.current?.scrollTo(0, scrollRef.current?.scrollHeight)
        }
    })

    /**
     * Instead of maintaining two arrays for messages and previous messages, we can maintain a single array
     * This is maintained by the useSWR hook (useFrappeGetCall) here.
     * 
     * We use the mutate method to update the messages array when messages are received, updated, deleted, etc.
     * Even if the user scrolls up and loads older messages, the hook is mutated by concatenating the older messages to the existing messages array
     * 
     * Since we are using Web Socket events, this saves multiple round-trips to the server to fetch messages (pre Raven v1.5)
     * 
     * When the page changes and the user comes back to the chat, the messages are fetched again and hence the messages array is updated with only new messages
     * 
     * This also helps when the user goes directly to a specific message from somewhere(notification, search etc.). 
     * We just shift the base message and fire the `get_messages` API to get the messages around the base message.
     * Post that, the behaviour is the same - if the user scrolls up or down, we just mutate the messages array directly.
     * If a new messages comes in while the user is viewing the base message (i.e. the latest messages are not visible), we do not update the messages array.
     * This is tracked using the `has_new_messages` flag in the response from the `get_messages` API
     * 
     * Below are the Web Socket events and they are all handled by mutating the messages array directly
     * 
     * Refer: https://swr.vercel.app/docs/mutation 
     */

    useFrappeDocumentEventListener('Raven Channel', channelID ?? '', () => { })

    // If there are new messages in the channel, update the messages
    useFrappeEventListener('message_created', (event) => {
        if (event.channel_id === channelID) {

            mutate((d) => {
                if (d) {
                    // Update the array of messages - append the new message in it and then sort it by date
                    const existingMessages = d.message.messages ?? []
                    const newMessages = [...existingMessages, event.message_details]

                    newMessages.sort((a, b) => {
                        return new Date(b.creation).getTime() - new Date(a.creation).getTime()
                    })
                    return ({
                        message: {
                            messages: newMessages,
                            has_old_messages: d.message.has_old_messages ?? false,
                            has_new_messages: d.message.has_new_messages ?? false
                        }
                    })
                }

            }, {
                revalidate: false,
            }).then(() => {
                // If the user is focused on the page, then we also need to 
                if (scrollRef.current) {
                    // We only scroll to the bottom if the user is close to the bottom
                    // TODO: Else we show a notification that there are new messages
                    if (scrollRef.current.scrollTop !== 0) {

                    }
                }
            })

        }
    })

    // If a message is edited, update the specific message
    useFrappeEventListener('message_edited', (event) => {

        mutate((d) => {
            if (event.message_id && d) {
                const newMessages = d.message.messages.map((message) => {
                    if (message.name === event.message_id) {
                        return {
                            ...message,
                            ...event.message_details,
                        }
                    } else {
                        return message
                    }
                })

                return ({
                    message: {
                        messages: newMessages,
                        has_old_messages: d.message.has_old_messages,
                        has_new_messages: d.message.has_new_messages
                    }
                })
            } else {
                return d
            }
        }, {
            revalidate: false,
        })
    })
    // If a message is deleted, update the messages array
    useFrappeEventListener('message_deleted', (event) => {

        mutate((d) => {
            if (d) {
                const newMessages = d.message.messages.filter((message) => message.name !== event.message_id)
                return ({
                    message: {
                        messages: newMessages,
                        has_old_messages: d.message.has_old_messages,
                        has_new_messages: d.message.has_new_messages
                    }
                })
            } else {
                return d
            }
        }, {
            revalidate: false,
        })
    })

    // If a message has new reactions, update the message
    useFrappeEventListener('message_reacted', (event) => {
        mutate(d => {
            if (event.message_id && d) {
                const newMessages = d.message.messages.map((message) => {
                    if (message.name === event.message_id) {
                        return {
                            ...message,
                            message_reactions: event.reactions
                        }
                    } else {
                        return message
                    }
                })

                return ({
                    message: {
                        messages: newMessages,
                        has_old_messages: d.message.has_old_messages,
                        has_new_messages: d.message.has_new_messages
                    }
                })
            } else {
                return d
            }
        }, {
            revalidate: false,
        })
    })


    // If a message is saved/unsaved, update the message
    useFrappeEventListener('message_saved', (event) => {

        mutate((d) => {
            if (event.message_id && d) {
                const newMessages = d.message.messages.map((message) => {
                    if (message.name === event.message_id) {
                        return {
                            ...message,
                            _liked_by: event.liked_by,
                        }
                    } else {
                        return message
                    }
                })

                return ({
                    message: {
                        messages: newMessages,
                        has_old_messages: d.message.has_old_messages,
                        has_new_messages: d.message.has_new_messages
                    }
                })
            } else {
                return d
            }
        }, {
            revalidate: false
        })

    })

    /** Callback to load older messages */
    const loadOlderMessages = () => {

        if (loadingOlderMessages || !data?.message.has_old_messages) {
            return
        }
        mutate((d) => {
            let oldestMessage: Message | null = null;
            if (d && d.message.messages.length > 0) {
                if (d.message.has_old_messages) {
                    oldestMessage = d.message.messages[d.message.messages.length - 1]

                    if (oldestMessage) {

                        return call({
                            channel_id: channelID,
                            from_message: oldestMessage.name,
                        }).then((res) => {
                            // console.log(res?.message.messages.map(m => m.name))
                            // console.log(oldestMessage?.name)

                            const mergedMessages = [...d.message.messages, ...res?.message.messages ?? []]

                            return {
                                message: {
                                    messages: mergedMessages,
                                    has_old_messages: res?.message.has_old_messages ?? false,
                                    has_new_messages: d?.message.has_new_messages ?? false
                                }
                            }

                        }).catch(() => {
                            // TODO: Handle errors here
                            return d
                        })
                    }
                }
            }
            return d
        }, {
            revalidate: false,
        })


    }

    const messages = useMemo(() => {
        // Loop through the messages array and add a date block before each date change
        // Also format the date to be displayed in the chat interface
        if (data) {

            const messages = [...data.message.messages]

            // Messages are already sorted by date - from latest to oldest
            // Date separator is added whenever the date changes
            // Add date separators
            const messagesWithDateSeparators: MessageDateBlock[] = []
            if (messages.length > 0) {
                let currentDate = messages[0].creation.split(' ')[0]

                // Loop through the messages and add date separators if the date changes
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i]
                    const messageDate = message.creation.split(' ')[0]

                    if (messageDate !== currentDate) {
                        messagesWithDateSeparators.push({
                            creation: convertFrappeTimestampToUserTimezone(`${messageDate} 00:00:00`).format('Do MMMM YYYY'),
                            message_type: 'date',
                            name: messageDate
                        })
                        currentDate = messageDate
                    }
                    messagesWithDateSeparators.push(message)
                }

                return messagesWithDateSeparators
            }
            else {
                return []
            }
        }
    }, [data])

    const changeBaseMessage = (messageID: string) => {
        setBaseMessage(messageID)
    }

    return {
        messages,
        hasOlderMessages: data?.message.has_old_messages ?? false,
        hasNewMessages: data?.message.has_new_messages ?? false,
        loadingOlderMessages,
        isLoading,
        error,
        loadOlderMessages,
        changeBaseMessage
    }
}

export default useChatStream