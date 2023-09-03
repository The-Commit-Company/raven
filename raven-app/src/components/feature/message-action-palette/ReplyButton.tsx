import { IconButton, Tooltip } from '@chakra-ui/react'
import { IoChatboxEllipsesOutline } from 'react-icons/io5'
import { Message } from '../../../../../types/Messaging/Message'

interface ReplyButtonProps {
    replyToMessage?: (message: Message) => void
    message: Message
}

export const ReplyButton = ({ replyToMessage, message }: ReplyButtonProps) => {

    const onReplyClick = () => {
        replyToMessage && replyToMessage(message)
    }

    return (
        <Tooltip hasArrow label='reply' size='xs' placement='top' rounded='md'>
            <IconButton
                onClick={onReplyClick}
                aria-label="reply"
                icon={<IoChatboxEllipsesOutline fontSize={'0.8rem'} />}
                size='xs' />
        </Tooltip>
    )
}