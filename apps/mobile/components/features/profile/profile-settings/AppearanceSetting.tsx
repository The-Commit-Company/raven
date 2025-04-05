import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme';
import PaletteIcon from '@assets/icons/PaletteIcon.svg'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { useMemo } from 'react';

const AppearanceSetting = () => {

    const { colors } = useColorScheme()
    const { themeValue, setColorScheme } = useColorScheme()

    const themeDisplay = useMemo(() => {
        if (themeValue === 'light') return 'Light'
        if (themeValue === 'dark') return 'Dark'
        if (themeValue === 'system') return 'System'
        return 'Light'
    }, [themeValue])

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-2'>
                    <PaletteIcon height={18} width={18} color={colors.icon} />
                    <Text className='text-base'>Appearance</Text>
                </View>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Text className='text-base text-muted-foreground/80'>{themeDisplay}</Text>
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
            </View>
        </View>
    )
}

export default AppearanceSetting