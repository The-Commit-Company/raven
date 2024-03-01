import { useFrappeDocumentEventListener, useFrappeEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { MutableRefObject, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Message } from '../../../../../../types/Messaging/Message'

interface GetMessagesResponse {
    message: {
        messages: Message[],
        has_old_messages: boolean
        has_new_messages: boolean
    }
}
/**
 * Hook to fetch messages to be rendered on the chat interface
 */
const useChatStream = (scrollRef: MutableRefObject<HTMLDivElement | null>) => {

    const { channelID } = useParams()

    const [hasOlderMessages, setHasOlderMessages] = useState(false)

    /** TODO: This will only be true if the base is changed */
    const [hasNewerMessages, setHasNewerMessages] = useState(false)

    const { call, loading: loadingOlderMessages } = useFrappePostCall('raven.api.chat_stream.get_older_messages')

    const [previousMessages, setPreviousMessages] = useState<Message[]>([])
    const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        'channel_id': channelID,
    }, `get_messages_for_channel_${channelID}`, {
        onSuccess: (data) => {
            setHasOlderMessages(data.message.has_old_messages)
            setHasNewerMessages(false)
            // Clear previous messages
            setPreviousMessages([])
            scrollRef.current?.scrollTo(0, scrollRef.current?.scrollHeight)
        }
    })

    useFrappeDocumentEventListener('Raven Channel', channelID ?? '', () => { })

    // If there are new messages in the channel, update the messages
    useFrappeEventListener('message_created', (event) => {
        if (event.channel_id === channelID && data) {
            // Update the array of messages - append the new message in it and then sort it by date
            const existingMessages = data.message.messages ?? []
            const newMessages = [...existingMessages, event.message_details]

            newMessages.sort((a, b) => {
                return new Date(b.creation).getTime() - new Date(a.creation).getTime()
            })
            mutate({
                message: {
                    messages: newMessages,
                    has_old_messages: data.message.has_old_messages ?? false,
                    has_new_messages: data.message.has_new_messages ?? false
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

        if (event.message_id && data) {
            const newMessages = data.message.messages.map((message) => {
                if (message.name === event.message_id) {
                    return {
                        ...message,
                        ...event.message_details,
                    }
                } else {
                    return message
                }
            })

            mutate({
                message: {
                    messages: newMessages,
                    has_old_messages: data.message.has_old_messages,
                    has_new_messages: data.message.has_new_messages
                }
            }, {
                revalidate: false,
            })
        }
    })
    // If a message is deleted, update the messages array
    useFrappeEventListener('message_deleted', (event) => {
        if (event.message_id && data) {
            const newMessages = data.message.messages.filter((message) => message.name !== event.message_id)
            mutate({
                message: {
                    messages: newMessages,
                    has_old_messages: data.message.has_old_messages,
                    has_new_messages: data.message.has_new_messages
                }
            }, {
                revalidate: false,
            })
        }
    })

    // If a message has new reactions, update the message
    useFrappeEventListener('message_reacted', (event) => {
        if (event.message_id && data) {
            const newMessages = data.message.messages.map((message) => {
                if (message.name === event.message_id) {
                    return {
                        ...message,
                        message_reactions: event.reactions
                    }
                } else {
                    return message
                }
            })

            mutate({
                message: {
                    messages: newMessages,
                    has_old_messages: data.message.has_old_messages,
                    has_new_messages: data.message.has_new_messages
                }
            }, {
                revalidate: false,
            })
        }
    })


    // If a message is saved/unsaved, update the message
    useFrappeEventListener('raven:message_saved', (event) => {
        if (event.message_id && data) {
            const newMessages = data.message.messages.map((message) => {
                if (message.name === event.message_id) {
                    return {
                        ...message,
                        _liked_by: event.liked_by,
                    }
                } else {
                    return message
                }
            })

            mutate({
                message: {
                    messages: newMessages,
                    has_old_messages: data.message.has_old_messages,
                    has_new_messages: data.message.has_new_messages
                }
            }, {
                revalidate: false,
            })
        }
    })

    /** Callback to load older messages */
    const loadOlderMessages = () => {

        if (loadingOlderMessages) {
            return
        }

        let oldestMessage: Message | null = null;
        if (previousMessages.length === 0 && data) {
            oldestMessage = data.message.messages[data.message.messages.length - 1]
        } else {
            oldestMessage = previousMessages[previousMessages.length - 1]
        }

        if (oldestMessage) {
            call({
                channel_id: channelID,
                from_message: oldestMessage.name,
            }).then((res) => {
                // console.log(res?.message.messages.map(m => m.name))
                // console.log(oldestMessage?.name)
                setPreviousMessages((p) => [...p, ...res?.message.messages ?? []])
                setHasOlderMessages(res?.message.has_old_messages ?? false)
            }).catch(() => {
                // TODO: Handle errors here
            })
        }

    }


    // console.log(data)

    const messages = useMemo(() => {
        // TODO: Loop through the messages array and add a date block before each date change
        // TODO: Also format the date to be displayed in the chat interface
        if (data) {
            return [...data.message.messages, ...previousMessages]
        }
    }, [data, previousMessages])

    return {
        messages,
        hasOlderMessages,
        loadingOlderMessages,
        isLoading,
        error,
        loadOlderMessages
    }
}

export default useChatStream