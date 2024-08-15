import { Message } from '../../../../../../types/Messaging/Message'
import { useRef } from 'react'
import { Loader } from '@/components/common/Loader'
import clsx from 'clsx'
import { DateSeparator } from '@/components/layout/Divider/DateSeparator'
import { useInView } from 'react-intersection-observer'
import { Button } from '@radix-ui/themes'
import { FiArrowDown } from 'react-icons/fi'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { DeleteMessageDialog, useDeleteMessage } from '../../chat/ChatMessage/MessageActions/DeleteMessage'
import { EditMessageDialog, useEditMessage } from '../../chat/ChatMessage/MessageActions/EditMessage'
import { ForwardMessageDialog, useForwardMessage } from '../../chat/ChatMessage/MessageActions/ForwardMessage'
import useThreadStream from './useThreadStream'
import ChatStreamLoader from '../../chat/ChatStream/ChatStreamLoader'
import { MessageItem } from '../../chat/ChatMessage/MessageItem'

type Props = {
    replyToMessage: (message: Message) => void
}

const ThreadStream = ({ replyToMessage }: Props) => {

    const scrollRef = useRef<HTMLDivElement | null>(null)

    const { messages, hasOlderMessages, loadOlderMessages, goToLatestMessages, hasNewMessages, error, loadNewerMessages, isLoading, highlightedMessage, scrollToMessage } = useThreadStream(scrollRef)
    const { setDeleteMessage, ...deleteProps } = useDeleteMessage()

    const { setEditMessage, ...editProps } = useEditMessage()
    const { setForwardMessage, ...forwardProps } = useForwardMessage()

    const onReplyMessageClick = (messageID: string) => {
        scrollToMessage(messageID)
    }

    const { ref: oldLoaderRef } = useInView({
        fallbackInView: true,
        initialInView: false,
        skip: !hasOlderMessages,
        onChange: (async (inView) => {
            if (inView && hasOlderMessages) {
                const lastMessage = messages ? messages[0] : null;
                await loadOlderMessages()
                // Restore the scroll position to the last message before loading more
                if (lastMessage?.message_type === 'date') {
                    document.getElementById(`date-${lastMessage?.creation}`)?.scrollIntoView()
                } else {
                    document.getElementById(`message-${lastMessage?.name}`)?.scrollIntoView()
                }

            }
        })
    });

    const { ref: newLoaderRef } = useInView({
        fallbackInView: true,
        skip: !hasNewMessages,
        initialInView: false,
        onChange: (inView) => {
            if (inView && hasNewMessages) {
                loadNewerMessages()
            }
        }
    });

    return (
        <div className='relative h-full flex flex-col overflow-y-auto pb-16 sm:pb-0' ref={scrollRef}>
            <div ref={oldLoaderRef}>
                {hasOlderMessages && !isLoading && <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
                    <Loader />
                </div>}
            </div>
            {isLoading && <ChatStreamLoader />}
            {error && <ErrorBanner error={error} />}
            <div className={clsx('flex flex-col pb-4 z-50 transition-opacity duration-400 ease-ease-out-cubic', isLoading ? 'opacity-0' : 'opacity-100')}>
                {messages?.map(message => {
                    if (message.message_type === 'date') {
                        return <DateSeparator key={`date-${message.creation}`} id={`date-${message.creation}`} className='p-2 z-10 relative'>
                            {message.creation}
                        </DateSeparator>
                    } else {
                        return <div key={`${message.name}_${message.modified}`} id={`message-${message.name}`}>
                            <div className="w-full overflow-x-clip overflow-y-visible text-ellipsis animate-fadein">
                                <MessageItem
                                    message={message}
                                    isHighlighted={highlightedMessage === message.name}
                                    onReplyMessageClick={onReplyMessageClick}
                                    setEditMessage={setEditMessage}
                                    replyToMessage={replyToMessage}
                                    forwardMessage={setForwardMessage}
                                    setDeleteMessage={setDeleteMessage} />
                            </div>
                        </div>
                    }
                }
                )}
            </div>
            {hasNewMessages && <div ref={newLoaderRef}>
                <div className='flex w-full min-h-8 pb-4 justify-center items-center'>
                    <Loader />
                </div>
            </div>}

            {hasNewMessages && <div className='fixed bottom-36 z-50 right-5'>
                <Button
                    className='shadow-lg'
                    onClick={goToLatestMessages}>
                    Scroll to new messages
                    <FiArrowDown size={18} />
                </Button>
            </div>}
            <DeleteMessageDialog {...deleteProps} />
            <EditMessageDialog {...editProps} />
            <ForwardMessageDialog {...forwardProps} />
        </div>

    )
}

export default ThreadStream