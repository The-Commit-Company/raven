import clsx from 'clsx'
import React from 'react'
import { Message } from '@raven/types/common/Message'
import { Text, Pressable, View } from 'react-native'
import QuickReactions from './QuickReactions'
import ForwardIcon from "@assets/icons/ForwardIcon.svg"
import CopyIcon from "@assets/icons/CopyIcon.svg"
import BookMarkMinusIcon from "@assets/icons/BookMarkMinusIcon.svg"
import BookMarkPlusIcon from "@assets/icons/BookMarkPlusIcon.svg"
import ArrowBackRetractIcon from "@assets/icons/ArrowBackRetractIcon.svg"
import MessageIcon from "@assets/icons/MessageIcon.svg"
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator'
import { useMessageCopy } from './useMessageCopy'
import { useMessageSave } from './useMessageSave'
import useCreateThread from './useCreateThread'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import useRetractVote from './useRetractVote'
import { router } from 'expo-router'
import { useColorScheme } from '@hooks/useColorScheme'
import DeleteMessage from './DeleteMessage'

interface MessageActionsProps {
    message: Message
    onClose: () => void
}

const MessageActions = ({ message, onClose }: MessageActionsProps) => {

    const { colors } = useColorScheme()

    const { myProfile } = useCurrentRavenUser()

    const copy = useMessageCopy(message)
    const { createThread, isLoading: isCreatingThread } = useCreateThread(message)
    const { save, isLoading: isSaving, isSaved } = useMessageSave(message, myProfile?.name)
    const { retractVote, isLoading: isVoteRetracting, poll_data } = useRetractVote(message)

    const isOwner = myProfile?.name === message?.owner && !message?.is_bot_message

    const forwardMessage = () => {
        router.push({
            pathname: "../../forward-message",
            params: { ...message }
        }, { relativeToDirectory: true })
        onClose()
    }

    return (
        <View>

            <QuickReactions message={message} onClose={onClose} />

            {message?.message_type === 'Poll' && poll_data?.message.current_user_votes.length ?
                <MessageAction icon={<ArrowBackRetractIcon width={18} height={18} fill={colors.icon} />} title='Retract Vote' loading={isVoteRetracting} loadingText='Retracting vote...' onAction={() => retractVote(onClose)} /> : null}

            {/* <MessageAction title='Reply' icon={<ReplyIcon />} onAction={() => { }} /> */}
            <MessageAction title='Forward' icon={<ForwardIcon width={18} height={18} color={colors.icon} />} onAction={forwardMessage} />
            {!message?.is_thread ? <MessageAction title='Create Thread' icon={<MessageIcon width={18} height={18} fill={colors.icon} />} loading={isCreatingThread} loadingText="Creating thread..." onAction={() => createThread(onClose)} /> : null}

            {/* <MessageAction title='Copy Link' icon={<PaperClipIcon />} onAction={() => { }} /> */}
            {message?.message_type === "Text" ? <MessageAction title='Copy' icon={<CopyIcon width={18} height={18} fill={colors.icon} />} onAction={() => copy(onClose)} /> : null}
            {/* <MessageAction title='Download' icon={<DownloadIcon />} onAction={() => { }} /> */}
            <MessageAction title={isSaved ? 'Unsave Message' : 'Save Message'} icon={isSaved ? <BookMarkMinusIcon width={18} height={18} fill={colors.icon} /> : <BookMarkPlusIcon width={18} height={18} fill={colors.icon} />} loading={isSaving} loadingText={isSaved ? 'Unsaving...' : 'Saving...'} onAction={() => save(onClose)} />

            {isOwner ? <DeleteMessage message={message} onClose={onClose} /> : null}

        </View>
    )
}

export default MessageActions

interface MessageActionProps {
    onAction: () => void,
    title: string
    icon: React.ReactNode
    loading?: boolean
    loadingText?: string
    danger?: boolean
    className?: string
}

export const MessageAction = ({ onAction, icon, title, loading, loadingText, danger, className }: MessageActionProps) => {
    return (
        <Pressable
            onPress={onAction}
            className={clsx('flex flex-row items-center gap-3 px-2 py-3 rounded-lg ios:active:bg-linkColor', className)}
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            disabled={loading}>
            <Text className='text-sm text-foreground'>
                {loading ? <ActivityIndicator className='text-foreground' /> : icon}
            </Text>
            <Text className={clsx('text-sm text-foreground', loading ? 'opacity-70' : '')}>{loading ? loadingText ?? "Loading..." : <Text className={danger ? 'text-red-500' : ''}>{title}</Text>}</Text>
        </Pressable>
    )
}