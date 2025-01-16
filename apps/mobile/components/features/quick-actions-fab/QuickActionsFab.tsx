import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { Text } from '@components/nativewindui/Text'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useColorScheme } from '@hooks/useColorScheme'
import { TouchableOpacity, View, StyleSheet, Pressable } from 'react-native'
import PlusIcon from '@assets/icons/PlusIcon.svg'
import GlobeIcon from '@assets/icons/GlobeIcon.svg'
import UserIcon from '@assets/icons/UserIcon.svg'
import { COLORS } from '@theme/colors'
import { router } from 'expo-router'

const QuickActionsFab = () => {

    const { colors } = useColorScheme()
    const bottomSheetRef = useSheetRef()

    const openQuickActions = () => {
        bottomSheetRef.current?.present()
    }

    return (
        <View className='flex-1 gap-3'>
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={openQuickActions}>
                <PlusIcon fill={COLORS.white} height={20} width={20} />
            </TouchableOpacity>
            <Sheet snapPoints={[500]} ref={bottomSheetRef}>
                <BottomSheetView className='pb-12'>
                    <View className='flex flex-col'>
                        <Pressable style={styles.button} className='ios:active:bg-linkColor'
                            onPress={() => router.push('../home/browse-channels', { relativeToDirectory: true })}>
                            <GlobeIcon fill={colors.icon} height={18} width={18} />
                            <Text>Browse channels</Text>
                        </Pressable>
                        <Pressable style={styles.button} className='ios:active:bg-linkColor'
                            onPress={() => router.push('../home/create-channel', { relativeToDirectory: true })}>
                            <PlusIcon fill={colors.icon} height={18} width={18} />
                            <Text>Create new channel</Text>
                        </Pressable>
                        <Pressable style={styles.button} className='ios:active:bg-linkColor'>
                            <UserIcon fill={colors.icon} height={18} width={18} />
                            <Text>Open a direct message</Text>
                        </Pressable>
                    </View>
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 45,
        height: 45,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
    },
    button: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center'
    },
})

export default QuickActionsFab