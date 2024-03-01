import { Message } from '../../../../../../types/Messaging/Message'
import { DeleteMessageDialog, useDeleteMessage } from '../ChatMessage/MessageActions/DeleteMessage'
import { EditMessageDialog, useEditMessage } from '../ChatMessage/MessageActions/EditMessage'
import { MessageItem } from '../ChatMessage/MessageItem'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState'
import { useParams } from 'react-router-dom'
import useChatStream from './useChatStream'
import { UIEventHandler, useEffect, useRef, useState } from 'react'
import { Flex, ScrollArea } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'

type Props = {
    // TODO: Need to change this later to include date blocks
    // messages: Message[],
    // hasOlderMessages: boolean,
    replyToMessage: (message: Message) => void,
}

const ChatStream = ({ replyToMessage }: Props) => {

    const { channelID } = useParams()

    const scrollRef = useRef<HTMLDivElement | null>(null)

    const { messages, hasOlderMessages, loadOlderMessages, loadingOlderMessages } = useChatStream(scrollRef)
    const { setDeleteMessage, ...deleteProps } = useDeleteMessage()

    const { setEditMessage, ...editProps } = useEditMessage()

    const onReplyMessageClick = (messageID: string) => {
        scrollToMessage(messageID)
    }

    const [highlightedMessage, setHighlightedMessage] = useState<string | null>(null)

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

    const scrollToMessage = (messageID: string) => {
        // Check if the message is in the messages array
        const messageIndex = messages?.findIndex(message => message.name === messageID)
        // If it is, scroll to it
        if (messageIndex !== undefined && messageIndex !== -1) {
            // Found the message
            // Use the id to scroll to the message
            document.getElementById(`message-${messageID}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setHighlightedMessage(messageID)
        }

        // TODO: If not, change the base message, fetch the message and scroll to it.
    }

    const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
        if (hasOlderMessages) {
            // console.log("ST", e.currentTarget.scrollTop, e.currentTarget.scrollHeight, e.currentTarget.clientHeight)
            if (e.currentTarget.scrollTop - e.currentTarget.clientHeight + e.currentTarget.scrollHeight < 100) {
                loadOlderMessages()
            }
        }
    }


    return (
        <div className='h-full flex flex-col-reverse overflow-y-auto' ref={scrollRef} onScroll={handleScroll}>
            <div className='flex flex-col-reverse pb-4 z-50'>

                {messages?.map(message => {
                    return <div key={`${message.name}_${message.modified}`} id={`message-${message.name}`}>
                        <div className="w-full overflow-x-clip overflow-y-visible text-ellipsis">
                            <MessageItem
                                message={message}
                                isHighlighted={highlightedMessage === message.name}
                                onReplyMessageClick={onReplyMessageClick}
                                setEditMessage={setEditMessage}
                                replyToMessage={replyToMessage}
                                setDeleteMessage={setDeleteMessage} />
                        </div>
                    </div>
                })}

            </div>
            {loadingOlderMessages && <Flex className='w-full min-h-16 justify-center items-center'>
                <Loader />
            </Flex>}
            {!hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}
            <DeleteMessageDialog {...deleteProps} />
            <EditMessageDialog {...editProps} />
        </div>

    )
}

export default ChatStream