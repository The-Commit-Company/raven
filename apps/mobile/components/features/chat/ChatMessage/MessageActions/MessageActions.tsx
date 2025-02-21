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
import CopyMessageLink from './CopyMessageLink'
import DownloadMessageFile from './DownloadMessageFile'

interface MessageActionsProps {
    message: Message
    onClose: () => void
}

const MessageActions = ({ message, onClose }: MessageActionsProps) => {

    const { myProfile } = useCurrentRavenUser()
    const isOwner = myProfile?.name === message?.owner && !message?.is_bot_message

    return (
        <View className='flex flex-col gap-4'>

            <QuickReactions message={message} onClose={onClose} />

            <View className='flex flex-row gap-4 w-full'>
                <ReplyToMessage message={message} onClose={onClose} />
                <ForwardMessage message={message} onClose={onClose} />
                <SaveMessage message={message} onClose={onClose} />
            </View>

            <View className='flex flex-col gap-0'>

                {(message && message.message_type === 'Poll') && <RetractVote message={message} onClose={onClose} />}

                {(message && !message.is_thread) && <CreateThread message={message} onClose={onClose} />}

                {(message && message.message_type === 'Text') && <CopyMessage message={message} onClose={onClose} />}

                {(message && ['File', 'Image'].includes(message.message_type)) &&
                    <View className='flex flex-col gap-0'>
                        <CopyMessageLink message={message as FileMessage} onClose={onClose} />
                        <DownloadMessageFile message={message as FileMessage} onClose={onClose} />
                    </View>
                }

                {(message && isOwner) && <DeleteMessage message={message} onClose={onClose} />}

            </View>

        </View>
    )
}

export default MessageActions