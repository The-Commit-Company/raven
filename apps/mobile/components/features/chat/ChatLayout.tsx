import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useEffect, useRef } from 'react';
import { LegendListRef } from '@legendapp/list';
import MessageActionsBottomSheet from '@components/features/chat/ChatMessage/MessageActions/MessageActionsBottomSheet';
import { useSheetRef } from '@components/nativewindui/Sheet';
import { useAtom } from 'jotai';
import { messageActionsSelectedMessageAtom } from '@lib/ChatInputUtils';
import { Platform, View } from 'react-native';
import ChatStream from '../chat-stream/ChatStream';
import ChatInput from './ChatInput/ChatInput';

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;

const useGradualAnimation = () => {
    const height = useSharedValue(PADDING_BOTTOM)
    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            height.value = Math.max(event.height, PADDING_BOTTOM)
        },
    }, [])

    return { height }
}
type Props = {
    channelID: string,
    isThread?: boolean
}

const ChatLayout = ({ channelID, isThread = false }: Props) => {

    const { height } = useGradualAnimation()

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
            marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
        }
    })

    const scrollRef = useRef<LegendListRef>(null)

    const scrollToBottom = () => {
        scrollRef.current?.scrollToEnd({
            animated: true
        })
    }

    const onSendMessage = () => {
        scrollToBottom()
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
                <ChatStream channelID={channelID} scrollRef={scrollRef} isThread={isThread} />
                <ChatInput channelID={channelID} onSendMessage={onSendMessage} />
                <Animated.View style={fakeView} />
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