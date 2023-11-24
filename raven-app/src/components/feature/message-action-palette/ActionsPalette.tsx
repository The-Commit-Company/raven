import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext } from 'react'
import { UserContext } from '../../../utils/auth/UserProvider'
import { FileMessage, Message, TextMessage } from '../../../../../types/Messaging/Message'
import { EmojiButton } from './EmojiButton'
import { EmojiPickerButton } from './EmojiPickerButton'
import { ReplyButton } from './ReplyButton'
import { EditMessageButton } from './EditMessageButton'
import { BookmarkButton } from './BookmarkButton'
import { DownloadButton } from './DownloadButton'
import { DeleteMessageButton } from './DeleteMessageButton'
import { Box, Flex } from '@radix-ui/themes'

interface ActionButtonPaletteProps {
    message: Message,
    showButtons: {}
    is_continuation: 1 | 0,
    replyToMessage?: (message: Message) => void
    updateMessages: () => void
}

export const ActionsPalette = ({ message, showButtons, is_continuation, updateMessages, replyToMessage }: ActionButtonPaletteProps) => {

    const { name, owner, message_type } = message

    let text = ''
    let file = ''

    if (message_type === 'File' || message_type === 'Image') {
        const { file: fileValue } = message as FileMessage
        file = fileValue
    } else if (message_type === 'Text') {
        const { text: textValue } = message as TextMessage
        text = textValue
    }

    const { currentUser } = useContext(UserContext)

    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')
    const saveReaction = (emoji: string) => {
        if (name) {
            return reactToMessage({
                message_id: name,
                reaction: emoji
            }).then(() => updateMessages())
        }
    }

    return (
        <Box
            style={showButtons}
            className={`z-2 p-1 shadow-sm rounded-md bg-[var(--slate-2)] absolute ${is_continuation ? '-top-7' : '-top-4'} right-2`}>
            <Flex gap='1'>
                <EmojiButton emoji={'✅'} label={'done'} onClick={() => saveReaction('✅')} />
                <EmojiButton emoji={'👀'} label={'looking into this...'} onClick={() => saveReaction('👀')} />
                <EmojiButton emoji={'🎉'} label={'great job!'} onClick={() => saveReaction('🎉')} />
                <EmojiPickerButton saveReaction={saveReaction} />
                <ReplyButton replyToMessage={replyToMessage} message={message} />
                {(owner === currentUser) && text && <EditMessageButton messageID={name} text={text} />}
                <BookmarkButton message={message} updateMessages={updateMessages} />
                {file && <DownloadButton file={file} />}
                {(owner === currentUser) && <DeleteMessageButton messageID={name} />}
            </Flex>
        </Box>
    )
}