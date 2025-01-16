import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';
import { cn } from '@lib/cn';
import { COLORS } from '@theme/colors';
import BellOutlineIcon from '@assets/icons/BellOutlineIcon.svg';

export function ViewNotificationsButton() {
    return (
        <LayoutAnimationConfig skipEntering>
            <Animated.View
                className="items-center justify-center"
                key={"view-notifications"}
                entering={ZoomInRotate}>
                <Pressable
                    hitSlop={10}
                    onPress={() => {
                        console.log('Viewing notifications');
                    }}
                    className="opacity-80">
                    {({ pressed }) => (
                        <View className={cn('px-0.5', pressed && 'opacity-50')}>
                            <BellOutlineIcon fill={COLORS.white} width={21} height={21} />
                        </View>
                    )}
                </Pressable>
            </Animated.View>
        </LayoutAnimationConfig>
    )
}