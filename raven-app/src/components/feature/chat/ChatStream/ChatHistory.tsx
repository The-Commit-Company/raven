import { DateSeparator } from "../../../layout/Divider/DateSeparator";
import { DateBlock, Message, MessageBlock, MessagesWithDate } from "../../../../../../types/Messaging/Message";
import { ChannelHistoryFirstMessage } from "../../../layout/EmptyState/EmptyState";
import { useCallback, useContext, useRef, useState } from "react";
import { Virtuoso } from 'react-virtuoso';
import { VirtuosoRefContext } from "../../../../utils/message/VirtuosoRefProvider";
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider";
import { Box } from "@radix-ui/themes";
import { DateMonthYear } from "@/utils/dateConversions";
import { MessageItem } from "../ChatMessage/MessageItem";
import { DeleteMessageDialog, useDeleteMessage } from "../ChatMessage/MessageActions/DeleteMessage";
import { EditMessageDialog, useEditMessage } from "../ChatMessage/MessageActions/EditMessage";
import { FrappeConfig, FrappeContext, useSWRConfig } from "frappe-react-sdk";

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
interface ChatHistoryProps {
    parsedMessages: MessagesWithDate,
    replyToMessage: (message: Message) => void,
    channelData: ChannelListItem | DMChannelListItem
}

export const ChatHistory = ({ parsedMessages, replyToMessage, channelData }: ChatHistoryProps) => {

    const { virtuosoRef } = useContext(VirtuosoRefContext)

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { mutate } = useSWRConfig()

    const updateMessages = useCallback(() => {
        mutate(`get_messages_for_channel_${channelData.name}`)
    }, [channelData.name])

    const boxRef = useRef<HTMLDivElement>(null)

    const { setDeleteMessage, ...deleteProps } = useDeleteMessage()

    const { setEditMessage, ...editProps } = useEditMessage()

    const onReplyMessageClick = (messageID: string) => {
        if (virtuosoRef?.current) {
            call.get('raven.raven_messaging.doctype.raven_message.raven_message.get_index_of_message', {
                channel_id: channelData.name,
                message_id: messageID
            }).then((result) => {
                virtuosoRef.current?.scrollToIndex({ index: parseInt(result.message) ?? 'LAST', align: 'center', behavior: 'smooth' })
            })
        }

    }

    const [isScrolling, setIsScrolling] = useState(false)

    return (
        <Box ref={boxRef} height='100%' pb='2' className="overflow-y-scroll">
            <Virtuoso
                customScrollParent={boxRef.current ?? undefined}
                totalCount={parsedMessages.length}
                itemContent={(index, data, context) => <RenderItem block={parsedMessages[index]} index={index} {...data} {...context} isScrolling={isScrolling} />}
                initialTopMostItemIndex={parsedMessages.length - 1}
                components={{
                    Header: () => <ChannelHistoryFirstMessage channelID={channelData?.name} />,
                    Footer: () => <Box p='4' className="z-10 relative"></Box>
                }}
                isScrolling={setIsScrolling}
                context={{ channelData, replyToMessage, onReplyMessageClick, setDeleteMessage, updateMessages, setEditMessage }}
                ref={virtuosoRef}
                increaseViewportBy={300}
                alignToBottom={true}
                followOutput={'smooth'}
            />
            <DeleteMessageDialog {...deleteProps} />
            <EditMessageDialog {...editProps} />
        </Box>
    )
}

const RenderItem = ({ index, replyToMessage, updateMessages, block, onReplyMessageClick, channelData, setEditMessage, setDeleteMessage, isScrolling, ...props }: {
    index: number,
    block: MessageBlock | DateBlock,
    replyToMessage: (message: Message) => void,
    updateMessages: () => void,
    isScrolling: boolean,
    setDeleteMessage: (message: Message) => void,
    setEditMessage: (message: Message) => void,
    onReplyMessageClick: (messageID: string) => void,
    channelData: ChannelListItem | DMChannelListItem
}) => {

    return <Box>
        {block.block_type === 'date' ? <Box p='4' className="z-10 relative">
            <DateSeparator><DateMonthYear date={block.data} /></DateSeparator>
        </Box> :

            <Box className="w-full overflow-x-clip overflow-y-visible text-ellipsis">
                <MessageItem
                    message={block.data}
                    isScrolling={isScrolling}
                    updateMessages={updateMessages}
                    onReplyMessageClick={onReplyMessageClick}
                    setEditMessage={setEditMessage}
                    replyToMessage={replyToMessage}
                    setDeleteMessage={setDeleteMessage} />
            </Box>
        }
    </Box>
}