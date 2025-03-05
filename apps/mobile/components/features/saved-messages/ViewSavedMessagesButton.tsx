import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';
import { cn } from '@lib/cn';
import { COLORS } from '@theme/colors';
import BookmarkIcon from '@assets/icons/BookmarkIcon.svg';
import { router } from 'expo-router';

export function ViewSavedMessagesButton() {
    return (
        <LayoutAnimationConfig skipEntering>
            <Animated.View
                className="items-center justify-center"
                key={"view-saved-messages"}
                entering={ZoomInRotate}>
                <Pressable
                    hitSlop={10}
                    onPress={() => {
                        router.push('../home/saved-messages', { relativeToDirectory: true })
                    }}
                    className="opacity-80">
                    {({ pressed }) => (
                        <View className={cn('px-0.5', pressed && 'opacity-50')}>
                            <BookmarkIcon fill={COLORS.white} width={19} height={19} />
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </LayoutAnimationConfig>
    )
}