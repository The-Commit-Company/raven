import { Pressable, View } from 'react-native'
import { Text } from '@components/nativewindui/Text';
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import clsx from 'clsx'
import MessageReactions from './MessageItemElements/Reactions/MessageReactions'
import ShareForward from '@assets/icons/ShareForward.svg'
import { useMemo, memo, useCallback } from 'react';
import PinIcon from '@assets/icons/PinIcon.svg'
import { FileMessage, ImageMessage, PollMessage, TextMessage } from '@raven/types/common/Message'
import MessageAvatar from '@components/features/chat-stream/MessageItemElements/MessageAvatar'
import MessageHeader from '@components/features/chat-stream/MessageItemElements/MessageHeader'
import FileMessageRenderer from '@components/features/chat/ChatMessage/Renderers/FileMessageRenderer'
import { MessageLinkRenderer } from '@components/features/chat-stream/MessageItemElements/MessageLinkRenderer'
import DocTypeLinkRenderer from '@components/features/chat/ChatMessage/Renderers/DocTypeLinkRenderer'
import { PollMessageBlock } from '@components/features/chat/ChatMessage/Renderers/PollMessage'
import ReplyMessageBox from '@components/features/chat/ChatMessage/Renderers/ReplyMessageBox';
import { ImageMessageRenderer } from '@components/features/chat/ChatMessage/Renderers/ImageMessage';
import MessageTextRenderer from './MessageItemElements/MessageTextRenderer';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import useReactToMessage from '@raven/lib/hooks/useReactToMessage';
import { useAtomValue, useSetAtom } from 'jotai';
import { doubleTapMessageEmojiAtom } from '@lib/preferences';
import { messageActionsSelectedMessageAtom } from '@lib/ChatInputUtils';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import ViewThreadButton from './MessageItemElements/ViewThreadButton';
import { useColorScheme } from '@hooks/useColorScheme';
type Props = {
    message: FileMessage | PollMessage | TextMessage | ImageMessage
}

const MessageItem = memo(({ message }: Props) => {

    const { colors, isDarkColorScheme } = useColorScheme()

    const { linked_message, replied_message_details } = message

    const username = message.bot || message.owner

    const user = useGetUser(username)

    const userFullName = user?.full_name || username


    /** Double tap to react to the message */
    const react = useReactToMessage()

    const doubleTapMessageEmoji = useAtomValue(doubleTapMessageEmojiAtom)

    const reactToMessage = useCallback((emoji: string) => {
        impactAsync(ImpactFeedbackStyle.Light)
        react(message, emoji)
    }, [message, react])

    const doubleTapGesture = useMemo(() => {
        return Gesture.Tap()
            .numberOfTaps(2)
            .hitSlop(10)
            .onStart(() => {
                runOnJS(reactToMessage)(doubleTapMessageEmoji ?? '👍')
            }).requireExternalGestureToFail()
    }, [doubleTapMessageEmoji, reactToMessage])

    /** Long press to open the message actions sheet */
    const setSelectedMessage = useSetAtom(messageActionsSelectedMessageAtom(message.isOpenInThread ? 'thread' : 'channel'))

    const longPressToSelectMessage = useCallback(() => {
        impactAsync(ImpactFeedbackStyle.Medium)
        setSelectedMessage(message)
    }, [message, setSelectedMessage])

    const longPressGesture = useMemo(() => {
        return Gesture.LongPress()
            .minDuration(400)
            .hitSlop(10)
            .onStart(() => {
                runOnJS(longPressToSelectMessage)()
            })
    }, [longPressToSelectMessage])

    return (
        <GestureDetector gesture={Gesture.Exclusive(doubleTapGesture, longPressGesture)}>
            <Pressable
                hitSlop={10}
                className='relative rounded-lg active:bg-linkColor/60'
            >
                {!message.is_continuation && message.is_thread ?
                    <View
                        className={`absolute 
                        w-8
                        h-full
                        pb-9
                        pt-[34px]
                        top-5
                        left-8 z-0`}>
                        <View className='
                        border-b
                        border-l
                        h-full
                        z-0
                        border-border
                        rounded-bl-xl'>

                        </View>
                    </View> : null}
                <View className={clsx('flex-1 flex-row px-3 gap-1 pb-1', message.is_continuation ? 'pt-1' : 'pt-2')}>
                    <MessageAvatar
                        userFullName={userFullName}
                        userImage={user?.user_image}
                        isBot={!!message.bot}
                        userID={message.owner}
                        botID={message.bot}
                        is_continuation={message.is_continuation}
                    />
                    <View className='flex-1 items-start'>
                        <MessageHeader
                            is_continuation={message.is_continuation}
                            userFullName={userFullName}
                            timestamp={message.formattedTime || ''}
                        />
                        <View className='flex-1 w-full gap-1'>
                            {message.is_forwarded === 1 &&
                                <View className='flex-row items-center gap-1'>
                                    <ShareForward fill={'#6b7280'} width={12} height={12} />
                                    <Text className='text-sm text-muted-foreground'>
                                        forwarded
                                    </Text>
                                </View>}
                            {message.is_pinned === 1 &&
                                <View className='flex-row items-center gap-1'>
                                    <PinIcon width={12} height={12} fill={isDarkColorScheme ? '#5753C6' : '#787BE3'} />
                                    <Text className='text-sm text-primary dark:text-secondary'>Pinned</Text>
                                </View>}

                            {linked_message && replied_message_details && <ReplyMessageBox
                                // onPress={() => {
                                //     console.log('reply message pressed')
                                // }}
                                message={message}
                            />}

                            {message.text ? <MessageTextRenderer text={message.text} /> : null}
                            {message.message_type === 'Image' && <ImageMessageRenderer message={message} doubleTapGesture={doubleTapGesture} />}
                            {message.message_type === 'File' && <FileMessageRenderer message={message} doubleTapGesture={doubleTapGesture} />}
                            {message.message_type === 'Poll' && <PollMessageBlock message={message} />}

                            {message.link_doctype && message.link_document && <View className={clsx('pt-1.5', message.is_continuation ? 'ml-0.5' : '-ml-0.5')}>
                                <DocTypeLinkRenderer doctype={message.link_doctype} docname={message.link_document} />
                            </View>}

                            {message.is_edited === 1 && <Text className='text-xs text-muted-foreground'>(edited)</Text>}
                            {message.hide_link_preview === 0 && message.text && <MessageLinkRenderer message={message} />}
                            <MessageReactions message={message} longPressGesture={longPressGesture} />
                            {message.is_thread === 1 && <View className='flex self-start mt-1'><ViewThreadButton message={message} /></View>}
                        </View>
                    </View>
                </View>
            </Pressable>
        </GestureDetector>
    )
})

export default MessageItem
