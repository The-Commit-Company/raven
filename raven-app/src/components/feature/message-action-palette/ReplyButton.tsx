import { Message } from '../../../../../types/Messaging/Message'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { Reply } from 'lucide-react'

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
                <Reply size='14' />
            </IconButton>
        </Tooltip>
    )
}