import { Box, HStack } from '@chakra-ui/react'
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
import { useTheme } from '@/ThemeProvider'

interface ActionButtonPaletteProps {
    message: Message,
    showButtons: {}
    handleScroll: (newState: boolean) => void,
    is_continuation: 1 | 0,
    replyToMessage?: (message: Message) => void
    updateMessages: () => void
}

export const ActionsPalette = ({ message, showButtons, handleScroll, is_continuation, updateMessages, replyToMessage }: ActionButtonPaletteProps) => {

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

    const { appearance } = useTheme()
    const BGCOLOR = appearance === 'light' ? 'white' : 'black'
    const BORDERCOLOR = appearance === 'light' ? 'gray.200' : 'gray.700'

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
            rounded='md'
            bgColor={BGCOLOR}
            p='1'
            style={showButtons}
            boxShadow='bottom'
            border='1px'
            borderColor={BORDERCOLOR}
            width='fit-content'
            zIndex={2}
            position='absolute'
            top={is_continuation === 0 ? -4 : -7}
            right={2}>
            <HStack spacing={1}>
                <EmojiButton emoji={'✅'} label={'done'} onClick={() => saveReaction('✅')} />
                <EmojiButton emoji={'👀'} label={'looking into this...'} onClick={() => saveReaction('👀')} />
                <EmojiButton emoji={'🎉'} label={'great job!'} onClick={() => saveReaction('🎉')} />
                <EmojiPickerButton saveReaction={saveReaction} handleScroll={handleScroll} />
                <ReplyButton replyToMessage={replyToMessage} message={message} />
                {(owner === currentUser) && text && <EditMessageButton messageID={name} text={text} />}
                <BookmarkButton message={message} updateMessages={updateMessages} />
                {file && <DownloadButton file={file} />}
                {(owner === currentUser) && <DeleteMessageButton messageID={name} />}
            </HStack>
        </Box>
    )
}