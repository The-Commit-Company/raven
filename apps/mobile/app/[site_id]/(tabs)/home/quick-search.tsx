import { Link, router, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { Pressable, View, StyleSheet } from 'react-native';
import { SearchInput } from '@components/nativewindui/SearchInput';
import { Text } from '@components/nativewindui/Text';
import HashIcon from '@assets/icons/HashIcon.svg';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import UserIcon from '@assets/icons/UserIcon.svg';

export default function QuickSearch() {

    const { colors } = useColorScheme()

    const openMenuItemSheet = (url: string) => {
        router.back()
        router.push(url, { relativeToDirectory: false })
    }

    return <>
        <Stack.Screen options={{
            title: 'Quick search',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon fill={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            }
        }} />
        <View className="flex flex-col gap-3 p-3">
            <View>
                <SearchInput style={{ backgroundColor: colors.grey5 }}
                    placeholder="Search"
                    iconColor={colors.destructive}
                    placeholderTextColor={colors.grey} />
            </View>
            <View className='flex flex-row justify-center gap-2'>
                <Pressable style={styles.button} className='ios:active:bg-linkColor bg-card'
                    onPress={() => openMenuItemSheet('../home/browse-channels')}>
                    <HashIcon fill={colors.grey} height={20} width={20} />
                    <Text className='text-sm text-muted-foreground'>View channels</Text>
                </Pressable>
                <Pressable style={styles.button} className='ios:active:bg-linkColor bg-card'
                    onPress={() => openMenuItemSheet('../home/create-dm')}>
                    <UserIcon fill={colors.grey} height={20} width={20} />
                    <Text className='text-sm text-muted-foreground'>Open a DM</Text>
                </Pressable>
                <Pressable style={styles.button} className='ios:active:bg-linkColor bg-card'
                    onPress={() => openMenuItemSheet('../home/create-channel')}>
                    <PlusIcon fill={colors.grey} height={20} width={20} />
                    <Text className='text-sm text-muted-foreground'>New channel</Text>
                </Pressable>
            </View>
            <Text className='text-xs px-1 py-1 uppercase text-foreground'>Recent</Text>
        </View>
    </>
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 17,
        alignItems: 'center'
    }
})