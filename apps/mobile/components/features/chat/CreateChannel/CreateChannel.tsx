import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { Text } from '@components/nativewindui/Text'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { StyleSheet, Pressable } from 'react-native'
import CreateChannelForm from './CreateChannelForm'
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme'

const CreateChannel = () => {

    const bottomSheetRef = useSheetRef()

    const handleCreateChannel = () => {
        console.log("Create Channel")
        bottomSheetRef.current?.present()
    }

    const colors = useColorScheme()

    return (
        <>
            <Pressable style={styles.addChannelButton}
                onPress={handleCreateChannel}
                // Use tailwind classes for layout and ios:active state
                className={`flex-row items-center px-3 py-2 rounded-lg ios:active:bg-[${colors.colors.linkColor}] ios:active:dark:bg-[${colors.colors.linkColor}]`}
                // Add a subtle ripple effect on Android
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <PlusIcon fill={colors.colors.icon} height={18} width={18} />
                <Text style={styles.addChannelText}>Add channel</Text>
            </Pressable>
            <Sheet snapPoints={[780]} ref={bottomSheetRef}>
                <BottomSheetView className='pb-16'>
                    <CreateChannelForm />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

const styles = StyleSheet.create({
    addChannelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    addChannelText: {
        marginLeft: 12,
        fontSize: 16,
    },
})

export default CreateChannel