import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useCallback, useEffect, useRef } from 'react';
import { LegendListRef } from '@legendapp/list';
import MessageActionsBottomSheet from '@components/features/chat/ChatMessage/MessageActions/MessageActionsBottomSheet';
import { useSheetRef } from '@components/nativewindui/Sheet';
import { useAtom } from 'jotai';
import { messageActionsSelectedMessageAtom } from '@lib/ChatInputUtils';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, View } from 'react-native';
import ChatStream from '../chat-stream/ChatStream';
import ChatInput from './ChatInput/ChatInput';
import { JoinChannelBox } from '@components/features/chat/ChatFooter/JoinChannelBox';
import { ArchivedChannelBox } from '@components/features/chat/ChatFooter/ArchivedChannelBox';
import useShouldJoinChannel from '@hooks/useShouldJoinChannel';

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;

export const useGradualAnimation = () => {
    const height = useSharedValue(PADDING_BOTTOM)
    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            height.value = Math.max(event.height, PADDING_BOTTOM)
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
    isThread?: boolean
}

const ChatLayout = ({ channelID, isThread = false }: Props) => {
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

    const { canUserSendMessage, shouldShowJoinBox, channelMemberProfile, channelData, myProfile } = useShouldJoinChannel(channelID)

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
            marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
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
            messageActionsSheetRef.current?.present()
        } else {
            messageActionsSheetRef.current?.dismiss()
        }
    }, [selectedMessage])
    return (
        <>
            <View className='flex-1'>
                <ChatStream
                    channelID={channelID}
                    scrollRef={scrollRef}
                    isThread={isThread}
                    onScrollBeginDrag={checkIfNearBottom}
                    onMomentumScrollEnd={checkIfNearBottom}
                />
                {
                    canUserSendMessage &&
                    <>
                        <ChatInput channelID={channelID} onSendMessage={onSendMessage} />
                        <Animated.View style={fakeView} />
                    </>
                }
            </View>
            {
                shouldShowJoinBox &&
                <JoinChannelBox
                    channelData={channelData}
                    user={myProfile?.name ?? ""} />
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
            <MessageActionsBottomSheet
                messageActionsSheetRef={messageActionsSheetRef}
                message={selectedMessage}
                handleClose={handleSheetClose}
            />
        </>
    )
}

export default ChatLayout