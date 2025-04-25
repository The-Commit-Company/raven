import { FileMessage, Message } from '@raven/types/common/Message'
import { View } from 'react-native'
import QuickReactions from './QuickReactions'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import DeleteMessage from './DeleteMessage'
import ReplyToMessage from './ReplyToMessage'
import ForwardMessage from './ForwardMessage'
import SaveMessage from './SaveMessage'
import CreateThread from './CreateThread'
import CopyMessage from './CopyMessage'
import RetractVote from './RetractVote'
import EditMessageAction from './EditMessageAction'
import PinMessage from './PinMessage'
import CopyFileMessageLink from './CopyFileMessageLink'
import ShareMessageFile from './ShareMessageFile'

interface MessageActionsProps {
    message: Message
    onClose: () => void,
    quickReactionEmojis: string[]
    /** Whether the message is in a thread */
    isThread?: boolean
}

const MessageActions = ({ message, onClose, quickReactionEmojis, isThread = false }: MessageActionsProps) => {

    const { myProfile } = useCurrentRavenUser()
    const isOwner = myProfile?.name === message?.owner && !message?.is_bot_message

    return (
        <View className='flex flex-col gap-4'>

            <QuickReactions message={message} onClose={onClose} quickReactionEmojis={quickReactionEmojis} />

            <View className='flex flex-row gap-4 w-full justify-between'>
                <ReplyToMessage message={message} onClose={onClose} />
                <ForwardMessage message={message} onClose={onClose} />
                <SaveMessage message={message} onClose={onClose} />
            </View>

            <View className='flex flex-col gap-0'>

                {(message && message.message_type === 'Poll') && <RetractVote message={message} onClose={onClose} />}

                {(!isThread && message && !message.is_thread) && <CreateThread message={message} onClose={onClose} />}

                {(message && message.message_type === 'Text') && <CopyMessage message={message} onClose={onClose} />}

                {message && <PinMessage message={message} onClose={onClose} />}

                {(message && ['File', 'Image'].includes(message.message_type)) && (message as FileMessage).file &&
                    <View className='flex flex-col gap-0'>
                        <ShareMessageFile message={message as FileMessage} onClose={onClose} />
                        <CopyFileMessageLink message={message as FileMessage} onClose={onClose} />
                    </View>
                }

                {(message && isOwner) && message.message_type === 'Text' && <EditMessageAction message={message} onClose={onClose} />}

                {(message && isOwner) && <DeleteMessage message={message} onClose={onClose} />}
            </View>

        </View>
    )
}

export default MessageActions