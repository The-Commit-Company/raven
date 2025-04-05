import { Pressable, View } from 'react-native';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';
import * as DropdownMenu from 'zeego/dropdown-menu'
import { cn } from '@lib/cn';
import { useColorScheme } from '@hooks/useColorScheme';
import { COLORS } from '@theme/colors';
import SunIcon from '@assets/icons/SunIcon.svg';
import MoonIcon from '@assets/icons/MoonIcon.svg';
import SunMoonIcon from '@assets/icons/SunMoonIcon.svg';

export function ThemeToggle() {
    const { setColorScheme, themeValue } = useColorScheme();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <LayoutAnimationConfig skipEntering>
                    <Animated.View
                        className="items-center justify-center"
                        key={"toggle-" + themeValue}
                        entering={ZoomInRotate}>
                        <Pressable
                            hitSlop={10}
                            className="opacity-80">
                            {themeValue === 'dark'
                                ? ({ pressed }) => (
                                    <View className={cn('px-0.5', pressed && 'opacity-50')}>
                                        <MoonIcon color={COLORS.white} width={20} height={20} />
                                    </View>
                                )
                                : themeValue === 'system'
                                    ? ({ pressed }) => (
                                        <View className={cn('px-0.5', pressed && 'opacity-50')}>
                                            <SunMoonIcon color={COLORS.white} width={20} height={20} />
                                        </View>
                                    )
                                    : ({ pressed }) => (
                                        <View className={cn('px-0.5', pressed && 'opacity-50')}>
                                            <SunIcon color={COLORS.white} width={20} height={20} />
                                        </View>
                                    )}
                        </Pressable>
                    </Animated.View>
                </LayoutAnimationConfig>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content side='bottom' align='end'>
                <DropdownMenu.Item key="light" onSelect={() => setColorScheme('light')}>
                    <DropdownMenu.ItemIcon ios={{
                        name: 'sun.max', // Sun icon for light mode
                        pointSize: 16,
                        scale: 'medium',
                        hierarchicalColor: {
                            dark: 'gray',
                            light: 'gray',
                        },
                    }} />
                    <DropdownMenu.ItemTitle>Light</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key="dark" onSelect={() => setColorScheme('dark')}>
                    <DropdownMenu.ItemIcon ios={{
                        name: 'moon', // Moon icon for dark mode
                        pointSize: 16,
                        scale: 'medium',
                        hierarchicalColor: {
                            dark: 'gray',
                            light: 'gray',
                        },
                    }} />
                    <DropdownMenu.ItemTitle>Dark</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
                <DropdownMenu.Item key="system" onSelect={() => setColorScheme('system')}>
                    <DropdownMenu.ItemIcon ios={{
                        name: 'circle.lefthalf.filled',
                        pointSize: 16,
                        scale: 'medium',
                        hierarchicalColor: {
                            dark: 'gray',
                            light: 'gray',
                        },
                    }} />
                    <DropdownMenu.ItemTitle>System</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}