import { Platform, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
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

export const ChatLayout = ({ id }: { id: string }) => {

    const { height } = useGradualAnimation()

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
            marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
        }
    })

    return <View className='flex-1'>
        <ChatStream channelID={id as string} />
        <ChatInput />
        <Animated.View style={fakeView} />
    </View>
}