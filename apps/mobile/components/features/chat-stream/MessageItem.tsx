import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text';
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import clsx from 'clsx'
import ShareForward from '@assets/icons/ShareForward.svg'
import { useMemo, memo } from 'react';
import PushPin from '@assets/icons/PushPin.svg'
import { FileMessage, ImageMessage, PollMessage, TextMessage } from '@raven/types/common/Message'
import MessageAvatar from '@components/features/chat-stream/MessageItemElements/MessageAvatar'
import MessageHeader from '@components/features/chat-stream/MessageItemElements/MessageHeader'
import FileMessageRenderer from '@components/features/chat/ChatMessage/Renderers/FileMessageRenderer'
import { MessageLinkRenderer } from '@components/features/chat-stream/MessageItemElements/MessageLinkRenderer'
import DocTypeLinkRenderer from '@components/features/chat/ChatMessage/Renderers/DocTypeLinkRenderer'
import { PollMessageBlock } from '@components/features/chat/ChatMessage/Renderers/PollMessage'
import ReplyMessageBox from '@components/features/chat/ChatMessage/ReplyMessageBox/ReplyMessageBox';
import { ImageMessageRenderer } from '@components/features/chat/ChatMessage/Renderers/ImageMessage';
import MessageTextRenderer from './MessageItemElements/MessageTextRenderer';

type Props = {
    message: FileMessage | PollMessage | TextMessage | ImageMessage,
    onReplyMessagePress: () => void
}

const MessageItem = memo(({ message, onReplyMessagePress }: Props) => {

    const { linked_message, replied_message_details } = message

    const username = message.bot || message.owner

    const user = useGetUser(username)

    const userFullName = user?.full_name || username

    const replyMessageDetails = useMemo(() => {
        if (typeof replied_message_details === 'string') {
            return JSON.parse(replied_message_details)
        } else {
            return replied_message_details
        }
    }, [replied_message_details])


    return (
        <View className={clsx('flex-1 flex-row px-2 gap-1', message.is_continuation ? 'pt-0' : 'pt-2')}>
            <MessageAvatar
                userFullName={userFullName}
                userImage={user?.user_image}
                isBot={!!message.bot}
                userID={message.owner}
                botID={message.bot}
                is_continuation={message.is_continuation}
            />
            <View className='flex-1 items-start gap-1'>
                <MessageHeader
                    is_continuation={message.is_continuation}
                    userFullName={userFullName}
                    timestamp={message.formattedTime || ''}
                />
                {message.is_forwarded === 1 &&
                    <View className='flex-row items-center gap-1'>
                        <ShareForward fill={'#6b7280'} width={12} height={12} />
                        <Text className='text-xs text-gray-500 dark:text-gray-400'>
                            forwarded
                        </Text>
                    </View>}
                {message.is_pinned === 1 &&
                    <View className='flex-row items-center gap-1'>
                        <PushPin width={12} height={12} />
                        <Text className='text-xs text-accent'>Pinned</Text>
                    </View>}

                {linked_message && replied_message_details && <ReplyMessageBox
                    className='mb-1'
                    onPress={onReplyMessagePress}
                    message={replyMessageDetails}
                />
                }

                {message.text ? <MessageTextRenderer text={message.text} /> : null}
                {message.message_type === 'Image' && <ImageMessageRenderer message={message} />}
                {message.message_type === 'File' && <FileMessageRenderer message={message} />}
                {message.message_type === 'Poll' && <PollMessageBlock message={message} />}

                {message.link_doctype && message.link_document && <View className={clsx(message.is_continuation ? 'ml-0.5' : '-ml-0.5')}>
                    <DocTypeLinkRenderer doctype={message.link_doctype} docname={message.link_document} />
                </View>}

                {message.is_edited === 1 && <Text className='text-xs text-gray-500 dark:text-gray-400'>(edited)</Text>}
                {message.hide_link_preview === 0 && message.text && <MessageLinkRenderer message={message} />}
            </View>
        </View>
    )
})

export default MessageItem
