import { Message } from '../../../../../../types/Messaging/Message'
import { DeleteMessageDialog, useDeleteMessage } from '../ChatMessage/MessageActions/DeleteMessage'
import { EditMessageDialog, useEditMessage } from '../ChatMessage/MessageActions/EditMessage'
import { MessageItem } from '../ChatMessage/MessageItem'
import { ChannelHistoryFirstMessage } from '@/components/layout/EmptyState'
import { useParams } from 'react-router-dom'
import useChatStream from './useChatStream'
import { UIEventHandler, useEffect, useRef, useState } from 'react'
import { Flex } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'
import ChatStreamLoader from './ChatStreamLoader'
import clsx from 'clsx'
import { DateSeparator } from '@/components/layout/Divider/DateSeparator'

/**
 * Anatomy of a message
 * 
 * A message "stream" is a list of messages separated by dates
 * 
 * A date block is a simple divider with a date. Any message below the divider was sent on this date.
 * Two date blocks can never be adjacent to each other.
 * 
 * A message block can be of multiple types depending on the message type + who sent it and when.
 * 
 * If two messages are sent by the same person within 2 minutes of each other, they are grouped together.
 * The first message in such a group will have a User Avatar, Name and timestamp, and the rest will not.
 * Subsequent message blocks in this 'mini-block' will only show a timestamp on hover.
 * 
 * The message block can be of the following types:
 * 1. Image - this will show a preview of the image. Clicking on it will open the image in a modal.
 * 2. File - this will show a small box with the file name with actions to copy the link or download the file.
 *      PDF - PDF files will also have an action to open the file in a modal.
 *      Video - A video file will have a preview of the video.
 * 3. Text - this will show the text message in a tiptap renderer. A text block can have multiple elements
 *     1. Text - this will show the text as is (p, h1, h2, h3, h4, h5, h6, blockquote, li, ul, ol)
 *     2. Code - this will show in a container with a quick action button to copy it
 *     3. Mention - this will show the mentioned user's name (highlighted) and hovering over them should show a card with their details
 * 
 * A message can also be a reply to another message. In this case, the message will have a small box at the top with the message content and a click will jump to the message.
 * 
 * Every message has reactions at the very bottom. Every reaction has a count and a list of users who reacted to it.
 * 
 * Every message will have a context menu (right click) with the following options:
 * 1. Reply - this will open the reply box with the message quoted
 * 2. Edit - this will open the edit box with the message content
 * 3. Delete - this will delete the message
 * 4. Copy - this will copy the message content
 * 5. Copy Link - this will copy the message link (if file)
 * 6. Send in an email
 * 7. Link with document
 * 8. Bookmark
 * 
 * Every message will have a hover menu with the following options:
 * 1. Reaction emojis with the frequently used emojis for that user on this channel
 * 2. Reply/Edit depending on the user
 * 3. Ellipsis to open the context menu
 * 
 */

type Props = {
    replyToMessage: (message: Message) => void,
}

const ChatStream = ({ replyToMessage }: Props) => {

    const { channelID } = useParams()

    const scrollRef = useRef<HTMLDivElement | null>(null)

    const { messages, hasOlderMessages, loadOlderMessages, loadingOlderMessages, isLoading, changeBaseMessage } = useChatStream(scrollRef)
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
        } else {

            // TODO: If not, change the base message, fetch the message and scroll to it.
            console.log("Changing base message")
            changeBaseMessage(messageID)
            setHighlightedMessage(messageID)
        }

    }

    const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
        if (hasOlderMessages) {
            if (e.currentTarget.scrollTop - e.currentTarget.clientHeight + e.currentTarget.scrollHeight < 100) {
                loadOlderMessages()
            }
        }
    }


    return (
        <div className='h-full flex flex-col-reverse overflow-y-auto' ref={scrollRef} onScroll={handleScroll}>
            {isLoading && <ChatStreamLoader />}
            <div className={clsx('flex flex-col-reverse pb-4 z-50 transition-opacity duration-400 ease-in-out', isLoading ? 'opacity-0' : 'opacity-100')}>
                {messages?.map(message => {
                    if (message.message_type === 'date') {
                        return <DateSeparator key={`date-${message.creation}`} className='p-2 z-10 relative'>
                            {message.creation}
                        </DateSeparator>
                    } else {
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
                    }
                }
                )}
            </div>
            {loadingOlderMessages && <Flex className='w-full min-h-16 justify-center items-center'>
                <Loader />
            </Flex>}
            {!isLoading && !hasOlderMessages && <ChannelHistoryFirstMessage channelID={channelID ?? ''} />}
            <DeleteMessageDialog {...deleteProps} />
            <EditMessageDialog {...editProps} />
        </div>

    )
}

export default ChatStream