import { Platform, View } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import ChatStream from '../chat-stream/ChatStream';
import ChatInput from './ChatInput/ChatInput';

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;
const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 90 : 70; // Increased offset for better button visibility

const useGradualAnimation = () => {
    const height = useSharedValue(PADDING_BOTTOM)
    const offset = useSharedValue(0)

    useKeyboardHandler({
        onMove: (event) => {
            "worklet";
            const keyboardHeight = Math.max(event.height, PADDING_BOTTOM);
            height.value = withSpring(keyboardHeight, {
                mass: 0.3,
                damping: 15,
                stiffness: 120,
            });

            // Add extra offset when keyboard is open to show Tiptap buttons
            offset.value = withSpring(
                keyboardHeight > PADDING_BOTTOM ? KEYBOARD_OFFSET : 0,
                {
                    mass: 0.3,
                    damping: 15,
                    stiffness: 120,
                }
            );
        },
    }, [])

    return { height, offset }
}

export const ChatLayout = ({ id }: { id: string }) => {
    const { height, offset } = useGradualAnimation()

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value + offset.value),
            marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
        }
    })

    const containerStyle = useAnimatedStyle(() => {
        return {
            flex: 1,
            transform: [{
                translateY: height.value > PADDING_BOTTOM ?
                    -Math.min((height.value + offset.value) * 0.15, 30) : 0 // Increased translation
            }]
        }
    })

    return (
        <Animated.View style={containerStyle}>
            <View className='flex-1'>
                <ChatStream channelID={id as string} />
                <ChatInput />
                <Animated.View style={fakeView} />
            </View>
        </Animated.View>
    )
}