import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useCallback, useEffect, useRef } from 'react';
import { LegendListRef } from '@legendapp/list';
import MessageActionsBottomSheet from '@components/features/chat/ChatMessage/MessageActions/MessageActionsBottomSheet';
import { useSheetRef } from '@components/nativewindui/Sheet';
import { useAtom } from 'jotai';
import { messageActionsSelectedMessageAtom } from '@lib/ChatInputUtils';
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent, Platform, View } from 'react-native';
import ChatStream from '../chat-stream/ChatStream';
import ChatInput from './ChatInput/ChatInput';
import { JoinChannelBox } from '@components/features/chat/ChatFooter/JoinChannelBox';
import { ArchivedChannelBox } from '@components/features/chat/ChatFooter/ArchivedChannelBox';
import useShouldJoinChannel from '@hooks/useShouldJoinChannel';
import { SafeAreaView } from 'react-native-safe-area-context';

export const useGradualAnimation = () => {
    const height = useSharedValue(0)
    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            height.value = event.height
        },
        onEnd: (event) => {
            "worklet";
            height.value = event.height
        }
    }, [])

    return { height }
}
type Props = {
    channelID: string,
    isThread?: boolean,
    pinnedMessagesString?: string
}

const ChatLayout = ({ channelID, isThread = false, pinnedMessagesString }: Props) => {
    const { height } = useGradualAnimation()
    const scrollRef = useRef<LegendListRef>(null)
    const isNearBottomRef = useRef(true)

    const checkIfNearBottom = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
        const paddingToBottom = 100
        const isNearBottom = layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom

        isNearBottomRef.current = isNearBottom
    }, [])

    const scrollToEndIfNearBottom = (animated: boolean = true) => {
        if (isNearBottomRef.current) {
            scrollRef.current?.scrollToEnd({
                animated
            })
        }
    }

    useKeyboardHandler({
        onStart: (e) => {
            'worklet';
            runOnJS(scrollToEndIfNearBottom)(false);
        },
        onMove: (e) => {
            'worklet';
            runOnJS(scrollToEndIfNearBottom)(false);
        },
        onEnd: (e) => {
            'worklet';
            runOnJS(scrollToEndIfNearBottom)(false);
        }
    }, [])

    const { canUserSendMessage, shouldShowJoinBox, channelData, myProfile, channelMemberProfile } = useShouldJoinChannel(channelID, isThread)

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
            marginBottom: 0,
        }
    }, [])

    const onSendMessage = () => {
        scrollRef.current?.scrollToEnd({
            animated: true
        })
    }

    const messageActionsSheetRef = useSheetRef()

    const [selectedMessage, setSelectedMessage] = useAtom(messageActionsSelectedMessageAtom(isThread ? 'thread' : 'channel'))

    const handleSheetClose = () => {
        setSelectedMessage(null)
    }

    useEffect(() => {
        return () => {
            setSelectedMessage(null)
        }
    }, [])

    useEffect(() => {
        if (selectedMessage) {
            // If the keyboard is open, we need to close it before opening the bottom sheet
            Keyboard.dismiss()
            messageActionsSheetRef.current?.present()
        } else {
            messageActionsSheetRef.current?.dismiss()
        }
    }, [selectedMessage])
    return (
        <>
            <SafeAreaView edges={['bottom']} className='flex-1'>
                <ChatStream
                    channelID={channelID}
                    scrollRef={scrollRef}
                    isThread={isThread}
                    onScrollBeginDrag={checkIfNearBottom}
                    onMomentumScrollEnd={checkIfNearBottom}
                    pinnedMessagesString={pinnedMessagesString}
                />
                <View className='min-h-16'>
                    {
                        canUserSendMessage ?
                            <ChatInput channelID={channelID} onSendMessage={onSendMessage} />
                            : null
                    }

                    {
                        shouldShowJoinBox ?
                            <JoinChannelBox
                                channelID={channelID}
                                isThread={isThread}
                                user={myProfile?.name ?? ""} />
                            : null
                    }
                    {
                        channelData?.is_archived ?
                            <ArchivedChannelBox
                                channelID={channelID}
                                isMemberAdmin={channelMemberProfile?.is_admin}
                            />
                            : null
                    }
                </View>

                <Animated.View style={fakeView} />
            </SafeAreaView>

            <MessageActionsBottomSheet
                messageActionsSheetRef={messageActionsSheetRef}
                message={selectedMessage}
                isThread={isThread}
                handleClose={handleSheetClose}
            />
        </>
    )
}

export default ChatLayout