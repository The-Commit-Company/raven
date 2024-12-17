import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';

import { cn } from '@lib/cn';
import { useColorScheme } from '@lib/useColorScheme';
import { COLORS } from '@theme/colors';

import SunIcon from '@assets/icons/SunIcon.svg';
import MoonIcon from '@assets/icons/MoonIcon.svg';

export function ThemeToggle() {
    const { colorScheme, setColorScheme } = useColorScheme();
    return (
        <LayoutAnimationConfig skipEntering>
            <Animated.View
                className="items-center justify-center"
                key={"toggle-" + colorScheme}
                entering={ZoomInRotate}>
                <Pressable
                    onPress={() => {
                        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
                    }}
                    className="opacity-80">
                    {colorScheme === 'dark'
                        ? ({ pressed }) => (
                            <View className={cn('px-0.5', pressed && 'opacity-50')}>
                                <MoonIcon color={COLORS.white} />
                            </View>
                        )
                        : ({ pressed }) => (
                            <View className={cn('px-0.5', pressed && 'opacity-50')}>
                                <SunIcon color={COLORS.black} />
                            </View>
                        )}
                </Pressable>
            </Animated.View>
        </LayoutAnimationConfig>
    );
}