import { Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { Message } from '@raven/types/common/Message';
import { useContext, useMemo } from 'react';
import { DMChannelListItem } from '@raven/types/common/ChannelListItem';
import { useCurrentChannelData } from '@raven/lib/hooks/useCurrentChannelData';
import { useGetUserRecords } from '@raven/lib/hooks/useGetUserRecords';
import { formatDateAndTime } from '@raven/lib/utils/dateConversions';
import { router } from 'expo-router';
import { SiteContext } from 'app/[site_id]/_layout';
import clsx from 'clsx';
import MessageAvatar from '../chat-stream/MessageItemElements/MessageAvatar';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import MessageHeader from '../chat-stream/MessageItemElements/MessageHeader';
import { ImageMessageRenderer } from '../chat/ChatMessage/Renderers/ImageMessage';
import { PollMessageBlock } from '../chat/ChatMessage/Renderers/PollMessage';
import FileMessageRenderer from '../chat/ChatMessage/Renderers/FileMessageRenderer';
import MessageTextRenderer from '../chat-stream/MessageItemElements/MessageTextRenderer';
import DocTypeLinkRenderer from '../chat/ChatMessage/Renderers/DocTypeLinkRenderer';
import { MessageLinkRenderer } from '../chat-stream/MessageItemElements/MessageLinkRenderer';
import PushPin from '@assets/icons/PushPin.svg'
import ShareForward from '@assets/icons/ShareForward.svg'
import ReplyMessageBox from '../chat/ChatMessage/Renderers/ReplyMessageBox';

const SavedMessageItem = ({ message }: { message: Message & { workspace?: string } }) => {

    const { creation, channel_id } = message
    const users = useGetUserRecords()
    const username = message.bot || message.owner
    const user = useGetUser(username)
    const userFullName = user?.full_name || username

    const { channel } = useCurrentChannelData(channel_id)
    const channelData = channel?.channelData

    const channelName = useMemo(() => {
        if (channelData) {
            if (channelData.is_direct_message) {
                const peer_user_name = users[(channelData as DMChannelListItem).peer_user_id]?.full_name ?? (channelData as DMChannelListItem).peer_user_id
                return `DM with ${peer_user_name}`
            } else {
                return channelData.channel_name
            }
        }
    }, [channelData])

    const { linked_message, replied_message_details } = message

    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename
    const handleNavigateToChannel = (channelID: string) => {
        router.push(`/${siteID}/chat/${channelID}`)
    }

    return (
        <Pressable
            className='pb-2 rounded-md ios:active:bg-linkColor ios:active:dark:bg-linkColor'
            onPress={() => handleNavigateToChannel(channel_id)}>
            <View>
                <View className='flex flex-row items-center px-3 pt-2 gap-2'>
                    <Text className='text-sm'>{channelName}</Text>
                    <Text className='text-[13px] text-muted'>|</Text>
                    <Text className='text-[13px] text-muted-foreground'>
                        {formatDateAndTime(creation)}
                    </Text>
                </View>
                <View className={clsx('flex-1 flex-row px-3 gap-1', message.is_continuation ? 'pt-0' : 'pt-2')}>
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

                        {linked_message && replied_message_details && <ReplyMessageBox message={message} />}

                        {message.text ? <MessageTextRenderer text={message.text} /> : null}
                        {message.message_type === 'Image' && <ImageMessageRenderer message={message} />}
                        {message.message_type === 'File' && <FileMessageRenderer message={message} />}
                        {message.message_type === 'Poll' && <PollMessageBlock message={message} />}

                        {message.link_doctype && message.link_document && <View className={clsx(message.is_continuation ? 'ml-0.5' : '-ml-0.5')}>
                            <DocTypeLinkRenderer doctype={message.link_doctype} docname={message.link_document} />
                        </View>}

                        {message.is_edited === 1 && <Text className='text-xs text-muted-foreground'>(edited)</Text>}
                        {message.hide_link_preview === 0 && message.text && <MessageLinkRenderer message={message} />}
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default SavedMessageItem