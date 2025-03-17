import { useFrappeDocumentEventListener, useFrappeEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { MutableRefObject, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useBeforeUnload, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Message } from '../../../../../../types/Messaging/Message'
import { getDateObject } from '@/utils/dateConversions/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { UserContext } from '@/utils/auth/UserProvider'
import { useIsMobile } from '@/hooks/useMediaQuery'

export interface GetMessagesResponse {
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
const useChatStream = (channelID: string, scrollRef: MutableRefObject<HTMLDivElement | null>, pinnedMessagesString?: string) => {

    const location = useLocation()
    const navigate = useNavigate()

    const isMobile = useIsMobile()

    const { currentUser } = useContext(UserContext)

    const [searchParams, setSearchParams] = useSearchParams()

    const selected_message = searchParams.get('message_id')

    const [highlightedMessage, setHighlightedMessage] = useState<string | null>(selected_message ? selected_message : null)

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        // Clear the highlighted message after 4 seconds
        if (highlightedMessage) {
            timer = setTimeout(() => {
                setHighlightedMessage(null)
            }, 4000)
        }

        return () => {
            if (timer)
                clearTimeout(timer)
        }
    }, [highlightedMessage])

    const { call: fetchOlderMessages, loading: loadingOlderMessages } = useFrappePostCall('raven.api.chat_stream.get_older_messages')
    const { call: fetchNewerMessages, loading: loadingNewerMessages } = useFrappePostCall('raven.api.chat_stream.get_newer_messages')

    /**
     * Ref that is updated when no new messages are available
     * Used to track visit when the user leaves the channel
     */
    const latestMessagesLoaded = useRef(false)

    /**
     * Ensures scroll to bottom happens after all content is loaded
     * Uses both RAF and a backup timeout for reliability
     */
    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        if (!scrollRef.current) return

        // First immediate scroll attempt
        requestAnimationFrame(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior
                })
            }
        })

        // Second attempt after a short delay
        const shortDelayTimer = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior
                })
            }
        }, 100)

        // Final backup attempt after longer delay
        const backupTimer = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior
                })
            }
        }, 500)

        return () => {
            clearTimeout(shortDelayTimer)
            clearTimeout(backupTimer)
        }
    }

    const scrollToMessageElement = (messageID: string, behavior: ScrollBehavior = 'smooth') => {

        // First immediate scroll attempt
        requestAnimationFrame(() => {
            document.getElementById(`message-${messageID}`)?.scrollIntoView({
                behavior,
                block: 'center'
            })
        })

        const shortDelayTimer = setTimeout(() => {
            document.getElementById(`message-${messageID}`)?.scrollIntoView({
                behavior,
                block: 'center'
            })
        }, 100)

        const backupTimer = setTimeout(() => {
            document.getElementById(`message-${messageID}`)?.scrollIntoView({
                behavior,
                block: 'center'
            })
        }, 250)

        return () => {
            clearTimeout(shortDelayTimer)
            clearTimeout(backupTimer)
        }
    }


    const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        'channel_id': channelID,
        'base_message': selected_message ? selected_message : undefined
    }, { path: `get_messages_for_channel_${channelID}`, baseMessage: selected_message ? selected_message : undefined }, {
        revalidateOnFocus: isMobile ? true : false,
        onSuccess: (data) => {
            let cleanup: (() => void) | undefined

            if (!highlightedMessage) {
                if (!data.message.has_new_messages) {
                    cleanup = scrollToBottom()
                    latestMessagesLoaded.current = true
                }
            } else {
                cleanup = scrollToMessageElement(highlightedMessage)
            }

            return () => {
                if (cleanup) cleanup()
            }
        }
    })

    /**
     * Additional effect to handle channel switches
     * This helps ensure proper scrolling when switching between channels
     */
    useEffect(() => {
        // Do not call this if the user is viewing a specific message
        if (!searchParams.get('message_id')) {
            const cleanup = scrollToBottom()
            return cleanup
        }
    }, [channelID])

    /** If the user has already loaded all the latest messages and exits the channel, we update the timestamp of last visit  */

    const { call: trackVisit } = useFrappePostCall('raven.api.raven_channel_member.track_visit')
    /**
     * Track visit when unmounting if new messages were loaded.
     * We are using a ref since the hook is not re-executed when the data is updated
     */
    useEffect(() => {
        /** Call */
        return () => {
            if (latestMessagesLoaded.current) {
                trackVisit({ channel_id: channelID })
            }
        }
    }, [channelID])

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
                if (d && d.message.has_new_messages === false) {
                    // Update the array of messages - append the new message in it and then sort it by date
                    const existingMessages = d.message.messages ?? []

                    const newMessages = [...existingMessages]
                    if (event.message_details) {
                        // Check if the message is already present in the messages array
                        const messageIndex = existingMessages.findIndex(message => message.name === event.message_details.name)

                        if (messageIndex !== -1) {
                            // If the message is already present, update the message
                            newMessages[messageIndex] = event.message_details
                        } else {
                            // If the message is not present, add the message to the array
                            newMessages.push(event.message_details)
                        }
                    }

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
                } else {
                    return d
                }

            }, {
                revalidate: false,
            }).then(() => {
                if (data?.message.has_new_messages === false) {
                    if (scrollRef.current) {
                        const isNearBottom = scrollRef.current.scrollTop + scrollRef.current.clientHeight >=
                            scrollRef.current.scrollHeight - 100

                        if (isNearBottom || event.message_details.owner === currentUser) {
                            scrollToBottom('smooth') // Smooth scroll for better UX when user is watching
                        }
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
            return Promise.resolve()
        }

        // Store current scroll position and height before loading
        const scrollContainer = scrollRef.current
        if (!scrollContainer) return Promise.resolve()

        const previousScrollHeight = scrollContainer.scrollHeight
        const previousScrollTop = scrollContainer.scrollTop

        return mutate((d) => {
            let oldestMessage: Message | null = null;
            if (d && d.message.messages.length > 0) {
                if (d.message.has_old_messages) {
                    oldestMessage = d.message.messages[d.message.messages.length - 1]

                    if (oldestMessage) {

                        return fetchOlderMessages({
                            channel_id: channelID,
                            from_message: oldestMessage.name,
                        }).then((res) => {

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
        }).then(() => {
            // After mutation, restore relative scroll position
            requestAnimationFrame(() => {
                if (scrollContainer) {
                    const newScrollHeight = scrollContainer.scrollHeight
                    const heightDifference = newScrollHeight - previousScrollHeight
                    scrollContainer.scrollTop = previousScrollTop + heightDifference
                }
            })
        })
    }

    /** Callback to load newer messages */
    const loadNewerMessages = () => {

        if (loadingNewerMessages || !data?.message.has_new_messages) {
            return Promise.resolve()
        }

        if (highlightedMessage) {
            // Do not load new messages when we are scrolling to a specific message via base message
            return Promise.resolve()
        }
        mutate((d) => {
            let newestMessage: Message | null = null;
            if (d && d.message.messages.length > 0) {
                if (d.message.has_new_messages) {
                    newestMessage = d.message.messages[0]

                    if (newestMessage) {

                        return fetchNewerMessages({
                            channel_id: channelID,
                            from_message: newestMessage.name,
                            limit: 10
                        }).then((res: any) => {

                            const mergedMessages = [...res?.message.messages ?? [], ...d.message.messages]

                            return {
                                message: {
                                    messages: mergedMessages,
                                    has_old_messages: d?.message.has_old_messages ?? false,
                                    has_new_messages: res?.message.has_new_messages ?? false
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
        }).then((res) => {
            if (res?.message.has_new_messages === false) {
                latestMessagesLoaded.current = true
                // Smooth scroll to bottom when loading new messages
                scrollToBottom('smooth')
            }
        })
    }

    const messages = useMemo(() => {
        // Loop through the messages array and add a date block before each date change
        // Also format the date to be displayed in the chat interface
        if (data) {

            let pinnedMessageIDs = pinnedMessagesString?.split('\n') ?? []
            pinnedMessageIDs = pinnedMessageIDs.map(messageID => messageID.trim())

            const messages = [...data.message.messages]

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
    }, [data, pinnedMessagesString])

    const scrollToMessage = (messageID: string) => {
        // Check if the message is in the messages array
        const messageIndex = messages?.findIndex(message => message.name === messageID)
        // If it is, scroll to it
        if (messageIndex !== undefined && messageIndex !== -1) {
            // Found the message
            // Use the id to scroll to the message
            document.getElementById(`message-${messageID}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setHighlightedMessage(messageID)

        } else {
            // If not, change the base message, fetch the message and scroll to it.
            setSearchParams({ message_id: messageID })
            setHighlightedMessage(messageID)
        }

    }

    const goToLatestMessages = () => {
        setSearchParams({})
    }

    return {
        messages,
        hasOlderMessages: data?.message.has_old_messages ?? false,
        hasNewMessages: data?.message.has_new_messages ?? false,
        loadingOlderMessages,
        isLoading,
        error,
        loadNewerMessages,
        loadOlderMessages,
        scrollToMessage,
        highlightedMessage,
        goToLatestMessages
    }
}

export default useChatStream