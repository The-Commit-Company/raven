import { Message } from '../../../../../types/Messaging/Message'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { BiReply } from 'react-icons/bi'

interface ReplyButtonProps {
    replyToMessage?: (message: Message) => void
    message: Message
}

export const ReplyButton = ({ replyToMessage, message }: ReplyButtonProps) => {

    const onReplyClick = () => {
        replyToMessage && replyToMessage(message)
    }

    return (
        <Tooltip content='reply'>
            <IconButton
                onClick={onReplyClick}
                variant='soft'
                size='1'
                color='gray'
                aria-label='reply'>
                <BiReply />
            </IconButton>
        </Tooltip>
    )
}