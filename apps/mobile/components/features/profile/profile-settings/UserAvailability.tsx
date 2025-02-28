import { View } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import * as DropdownMenu from 'zeego/dropdown-menu'
import CircleIcon from '@assets/icons/CircleIcon.svg'

const UserAvailability = () => {

    const { colors } = useColorScheme()

    return (
        <View>
            <View className='flex flex-row py-2.5 px-4 rounded-xl items-center justify-between bg-background dark:bg-card'>
                <View className='flex-row items-center gap-3'>
                    <CircleIcon height={14} width={14} color={colors.icon} />
                    <Text className='text-base'>Availability</Text>
                </View>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Text className='text-sm text-muted-foreground/80'>Available</Text>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content side='bottom' align='end'>
                        <DropdownMenu.Item key="light">
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
                        <DropdownMenu.Item key="dark">
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
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </View>
        </View>
    )
}

export default UserAvailability