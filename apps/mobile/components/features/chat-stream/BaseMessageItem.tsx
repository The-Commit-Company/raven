import clsx from 'clsx';
import MessageAvatar from '../chat-stream/MessageItemElements/MessageAvatar';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import MessageHeader from '../chat-stream/MessageItemElements/MessageHeader';
import { ImageMessageView } from '../chat/ChatMessage/Renderers/ImageMessage';
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage';
import { FileMessageView } from '../chat/ChatMessage/Renderers/FileMessageRenderer';
import MessageTextRenderer from '../chat-stream/MessageItemElements/MessageTextRenderer';
import DocTypeLinkRenderer from '../chat/ChatMessage/Renderers/DocTypeLinkRenderer';
import { MessageLinkRenderer } from '../chat-stream/MessageItemElements/MessageLinkRenderer';
import PinIcon from '@assets/icons/PinIcon.svg'
import ShareForward from '@assets/icons/ShareForward.svg'
import ReplyMessageBox from '../chat/ChatMessage/Renderers/ReplyMessageBox';
import { Message } from '@raven/types/common/Message';
import { View } from 'react-native';
import { Text } from '@components/nativewindui/Text';

export const BaseMessageItem = ({ message }: { message: Message }) => {

    const username = message.bot || message.owner
    const user = useGetUser(username)
    const userFullName = user?.full_name || username
    const { linked_message, replied_message_details } = message

    return (
        <View className={clsx('flex-1 flex-row px-3 gap-1', message.is_continuation ? 'pt-0' : 'pt-2')}>
            <MessageAvatar
                userFullName={userFullName}
                userImage={user?.user_image}
                isBot={!!message.bot}
                userID={message.owner}
                botID={message.bot}
                is_continuation={message.is_continuation}
            />
            <View className='flex-1 items-start gap-0'>
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
                        <PinIcon width={12} height={12} />
                        <Text className='text-xs text-accent'>Pinned</Text>
                    </View>}

                {linked_message && replied_message_details && <ReplyMessageBox message={message} />}

                {message.text ? <MessageTextRenderer text={message.text} /> : null}
                {message.message_type === 'Image' && <ImageMessageView message={message} />}
                {message.message_type === 'File' && <FileMessageView message={message} />}
                {message.message_type === 'Poll' && <PollMessageBlock message={message} />}

                {message.link_doctype && message.link_document && <View className={clsx(message.is_continuation ? 'ml-0.5' : '-ml-0.5')}>
                    <DocTypeLinkRenderer doctype={message.link_doctype} docname={message.link_document} />
                </View>}

                {message.is_edited === 1 && <Text className='text-xs text-muted-foreground'>(edited)</Text>}
                {message.hide_link_preview === 0 && message.text && <MessageLinkRenderer message={message} />}
            </View>
        </View>
    )
}