import { Message } from '@raven/types/common/Message'
import { View } from 'react-native'
import QuickReactions from './QuickReactions'
import ArrowBackRetractIcon from "@assets/icons/ArrowBackRetractIcon.svg"
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useColorScheme } from '@hooks/useColorScheme'
import DeleteMessage from './DeleteMessage'
import ReplyToMessage from './ReplyToMessage'
import ForwardMessage from './ForwardMessage'
import SaveMessage from './SaveMessage'
import CreateThread from './CreateThread'
import CopyMessage from './CopyMessage'
import RetractVote from './RetractVote'

interface MessageActionsProps {
    message: Message
    onClose: () => void
}

const MessageActions = ({ message, onClose }: MessageActionsProps) => {

    const { colors } = useColorScheme()

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

                {message?.message_type === 'Poll' ? <RetractVote message={message} onClose={onClose} /> : null}

                {!message?.is_thread ? <CreateThread message={message} onClose={onClose} /> : null}

                {/* <MessageAction title='Copy Link' icon={<PaperClipIcon />} onAction={() => { }} /> */}
                {message?.message_type === "Text" ? <CopyMessage message={message} onClose={onClose} /> : null}
                {/* <MessageAction title='Download' icon={<DownloadIcon />} onAction={() => { }} /> */}

                {isOwner ? <DeleteMessage message={message} onClose={onClose} /> : null}
            </View>

        </View>
    )
}

export default MessageActions