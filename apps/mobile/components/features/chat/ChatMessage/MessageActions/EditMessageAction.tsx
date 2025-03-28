import { useColorScheme } from '@hooks/useColorScheme'
import { Message } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import EditIcon from "@assets/icons/EditIcon.svg"
import { Text } from '@components/nativewindui/Text'
import EditMessageSheet from './EditMessageSheet'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'

interface EditMessageActionProps {
    message: Message
    onClose: () => void
}

const EditMessageAction = ({ message, onClose }: EditMessageActionProps) => {
    const { colors } = useColorScheme()
    const editSheetRef = useSheetRef()

    const handlePress = () => {
        editSheetRef.current?.present()
    }

    const handleClose = () => {
        // close both the edit sheet and the message actions sheet
        editSheetRef.current?.dismiss()

        setTimeout(() => {
            onClose()
        }, 100)
    }

    return (
        <>
            <Pressable
                onPress={handlePress}
                className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <EditIcon width={18} height={18} stroke={colors.icon} fillOpacity={0} />
                <Text className='text-base text-foreground'>Edit</Text>
            </Pressable>

            <Sheet enableDynamicSizing={false} ref={editSheetRef} snapPoints={['90']}>
                <BottomSheetView className='pb-8'>
                    <EditMessageSheet
                        message={message}
                        onClose={handleClose}
                    />
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default EditMessageAction