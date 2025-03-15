import { Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@hooks/useColorScheme';
import HeaderBackButton from '@components/common/HeaderBackButton';
import ChatStream from '@components/features/chat-stream/ChatStream';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ChatInput from '@components/features/chat/ChatInput/ChatInput';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import ThreadActions from '@components/features/threads/thread-actions/ThreadActions';

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

const Thread = () => {

    const { id } = useLocalSearchParams()

    const { colors } = useColorScheme()

    const { height } = useGradualAnimation()

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
            marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
        }
    })

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HeaderBackButton />,
                headerTitle: 'Thread',
                headerRight: () => <ThreadActions threadID={id as string} />
            }} />
            <View className='flex-1'>
                <ChatStream channelID={id as string} isThread />
                <ChatInput />
                <Animated.View style={fakeView} />
            </View>
        </>
    )
}

export default Thread