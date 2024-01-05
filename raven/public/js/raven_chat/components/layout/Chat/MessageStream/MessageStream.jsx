import React, { useLayoutEffect } from 'react'
import useSWR from 'swr'
import { fetcher } from '../../../../hooks/useFetch'
import MessageItem from '../MessageRenderer/MessageItem'
import DateItem from '../MessageRenderer/DateItem'

/** Fetches messages from the backend and renders them */
const MessageStream = ({ channelID }) => {


    const containerRef = React.useRef(null)

    const scrollToBottom = () => {
        const scrollHeight = containerRef.current?.scrollHeight
        const height = containerRef.current?.clientHeight
        containerRef.current?.scrollTo({
            top: scrollHeight - height,
            left: 0
        })
    }


    const { data, error, isLoading } = useSWR(`raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates?channel_id=${channelID}`, fetcher, {
        keepPreviousData: true
    })

    useLayoutEffect(() => {
        scrollToBottom()
    }, [scrollToBottom, data])



    return (
        <div>
            {/* TODO: Add Loading and Error states */}
            <div className='raven-message-stream-container' ref={containerRef}>
                {data?.message.map((message) => {
                    if (message.block_type === 'date') {
                        return <DateItem date={message.data} key={message.data} />
                    } else {
                        return (
                            <MessageItem message={message.data} key={message.data.name} />
                        )
                    }

                })
                }
            </div>

        </div>
    )
}

export default MessageStream