import React from 'react'
import useSWR from 'swr'
import { fetcher } from '../../../../hooks/useFetch'
import MessageItem from '../MessageRenderer/MessageItem'

/** TODO: Fetches a stream of messages from the backend and manages it's state */
const MessageStream = ({ channelID }) => {

    /**
     * By default, we fetch 50 latest messages and store it an array of messages - Done
     * 
     * The array is extended to older messages when the user scrolls to the top of the message stream
     * 
     * The array is extended to newer messages when a new message is sent, or when the user scrolls to the bottom of the message stream
     * 
     * A message in the array is updated when a message is updated
     * 
     * A message in the array is deleted when a message is deleted
     * 
     * The array itself is switched (completely new messages loaded) when the user clicks on a replied message which does not exist in the current array
     * 
     */

    /** Array to maintain messages */
    const [messages, setMessages] = React.useState([])
    const [hasOlderMessages, setHasOlderMessages] = React.useState(false)

    const [fetchingOlder, setFetchingOlder] = React.useState(false)

    const { } = useSWR(`raven.api.message_stream.get_messages?channel_id=${channelID}`, fetcher, {
        keepPreviousData: true,
        onSuccess: (data) => {
            //TODO: This will always fetch the latest messages, so we need to update the array in a way that it does not duplicate messages
            setMessages(data.message.messages)
            setHasOlderMessages(data.message.has_older_messages)
        }
    })

    /**
     * Triggered when the user scrolls to the top of the message stream
     */
    const fetchOlderMessages = () => {
        if (fetchingOlder || hasOlderMessages) return

        setFetchingOlder(true)
        frappe.call('raven.api.message_stream.get_messages', {
            channel_id: channelID,
            before_message: messages[messages.length - 1].name
        }).then((data) => {
            setMessages((m) => [...m, ...data.message.messages])
            setHasOlderMessages(data.message.has_older_messages)
            setFetchingOlder(false)
        })
    }

    /**
     * Triggered on realtime update of messages like:
     * 1. New Reaction
     * 2. Edited message
     * 3. On Save/Unsave
     */
    const onMessageUpdate = () => {

    }

    const onMessageDelete = () => {

    }

    console.log(messages)

    /**
     * Triggered when the user scrolls to the top of the message stream
     */
    const handleScroll = (e) => {
        const top = e.target.scrollHeight + e.target.scrollTop - e.target.clientHeight < 10
        if (top) {
            fetchOlderMessages()
        }
    }

    return (
        <div>
            {messages.length} messages
            <div onScroll={handleScroll} className='raven-message-stream-container'>
                {messages.map((message) => {
                    return (
                        <MessageItem message={message} key={message.name} />
                    )
                })
                }
            </div>

        </div>
    )
}

export default MessageStream