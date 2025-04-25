import { LegendListRef } from '@legendapp/list'
import { Message } from '@raven/types/common/Message'
import { useFrappeDocumentEventListener, useFrappeEventListener, useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { useEffect, useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { formatDate } from '@raven/lib/utils/dateConversions'
import useSiteContext from './useSiteContext'
import { GetMessagesResponse } from '@raven/types/common/ChatStream'
import { useTrackChannelVisit } from './useUnreadMessageCount'

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
    name: string,
    isOpenInThread: boolean,
    pinnedMessagesString?: string
}

export type MessageDateBlock = Message | DateBlock | HeaderBlock

const useChatStream = (channelID: string, listRef?: React.RefObject<LegendListRef>, isThread: boolean = false, pinnedMessagesString?: string) => {

    const siteInformation = useSiteContext()

    const isDataFetched = useRef(false)
    const latestMessagesLoaded = useRef(false)

    const SYSTEM_TIMEZONE = siteInformation?.system_timezone ? siteInformation.system_timezone : 'Asia/Kolkata'

    /**
     * Ensures scroll to bottom happens after all content is loaded
     * Uses both RAF and a backup timeout for reliability
     */
    // const scrollToBottom = (animated: boolean = false) => {
    //     console.log("Called scrolling")
    //     if (!listRef?.current) return

    //     console.log('Scrolling to bottom')

    //     // First immediate scroll attempt
    //     requestAnimationFrame(() => {
    //         if (listRef.current) {
    //             listRef.current.scrollToEnd({
    //                 animated
    //             })
    //         }
    //     })

    //     // Second attempt after a short delay
    //     const shortDelayTimer = setTimeout(() => {
    //         if (listRef.current) {
    //             listRef.current.scrollToEnd({
    //                 animated
    //             })
    //         }
    //     }, 250)

    //     // Final backup attempt after longer delay
    //     const backupTimer = setTimeout(() => {
    //         if (listRef.current) {
    //             listRef.current.scrollToEnd({
    //                 animated
    //             })
    //         }
    //     }, 800)
    // }

    const { data, isLoading, error, mutate } = useFrappeGetCall<GetMessagesResponse>('raven.api.chat_stream.get_messages', {
        channel_id: channelID,
        limit: 20

        // TODO: Add base message
    }, { path: `get_messages_for_channel_${channelID}` }, {
        onSuccess: (data) => {
            if (!isDataFetched.current) {
                isDataFetched.current = true

                // // Single attempt with RAF to ensure we're in the next frame
                // requestAnimationFrame(() => {
                //     // Check if we have both the ref and data
                //     if (data.message.messages?.length) {
                //         listRef?.current?.scrollToEnd({
                //             animated: false
                //         })

                //         // One backup attempt after a short delay
                //         setTimeout(() => {
                //             if (listRef?.current) {
                //                 listRef.current.scrollToEnd({
                //                     animated: false
                //                 })
                //             }
                //         }, 250)
                //     }
                // })
            }

            if (!data.message.has_new_messages) {
                latestMessagesLoaded.current = true
            }
        }
    })

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

    const trackVisit = useTrackChannelVisit(channelID, isThread)
    /**
     * Track visit when unmounting if new messages were loaded.
     * We are using a ref since the hook is not re-executed when the data is updated
     */
    useEffect(() => {
        /** Call */
        return () => {
            if (latestMessagesLoaded.current) {
                trackVisit()
            }
        }
    }, [channelID, trackVisit])

    const { call: fetchOlderMessages, loading: loadingOlderMessages } = useFrappePostCall('raven.api.chat_stream.get_older_messages')
    const { call: fetchNewerMessages, loading: loadingNewerMessages } = useFrappePostCall('raven.api.chat_stream.get_newer_messages')

    /** Callback to load older messages */
    const loadOlderMessages = () => {
        if (loadingOlderMessages || !data?.message.has_old_messages) {
            return Promise.resolve()
        }

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
        })
    }

    /** Callback to load newer messages */
    const loadNewerMessages = () => {

        if (loadingNewerMessages || !data?.message.has_new_messages) {
            return Promise.resolve()
        }

        // if (highlightedMessage) {
        //     // Do not load new messages when we are scrolling to a specific message via base message
        //     return Promise.resolve()
        // }
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
            }
        })
    }

    const messages = useMemo(() => {

        if (!data) return []

        // Loop through the messages array and add a date block before each date change
        // Also format the date to be displayed in the chat interface

        let pinnedMessageIDs = pinnedMessagesString?.split('\n') ?? []
        pinnedMessageIDs = pinnedMessageIDs.map(messageID => messageID.trim())

        // Messages are already sorted by date - from latest to oldest
        // Date separator is added whenever the date changes
        // Add `is_continuation` to the messages that are only apart by 2 minutes
        const messages = [...data.message.messages]

        const messagesWithDateSeparators: MessageDateBlock[] = []

        if (!data.message.has_old_messages || messages.length === 0) {
            messagesWithDateSeparators.push({
                message_type: 'header',
                isOpenInThread: isThread,
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
                is_continuation: 0,
                isOpenInThread: isThread,
                is_pinned: pinnedMessageIDs.includes(lastMessage.name) ? 1 : 0
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
                    messagesWithDateSeparators.push({ ...message, isOpenInThread: isThread, is_continuation: 0, formattedTime: formattedMessageTime, might_contain_link_preview, is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0 })
                } else if (messageDateTime - currentDateTime > 120000) {
                    messagesWithDateSeparators.push({ ...message, isOpenInThread: isThread, is_continuation: 0, formattedTime: formattedMessageTime, might_contain_link_preview, is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0 })
                } else {
                    messagesWithDateSeparators.push({ ...message, isOpenInThread: isThread, is_continuation: 1, formattedTime: formattedMessageTime, might_contain_link_preview, is_pinned: pinnedMessageIDs.includes(message.name) ? 1 : 0 })
                }

                currentDate = messageDate
                currentDateTime = new Date(message.creation).getTime()
            }

            return messagesWithDateSeparators
        }
        else {
            return messagesWithDateSeparators
        }



    }, [data, isThread, SYSTEM_TIMEZONE, pinnedMessagesString])

    return {
        data: messages,
        isLoading,
        error,
        mutate,
        loadOlderMessages,
        loadNewerMessages
    }



}

export default useChatStream