import { useColorScheme } from '@hooks/useColorScheme'
import { Message } from '@raven/types/common/Message'
import EditIcon from "@assets/icons/EditIcon.svg"
import EditMessageSheet from './EditMessageSheet'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import ActionButton from '@components/common/Buttons/ActionButton'

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

    const handleDismiss = () => {
        onClose()
    }

    return (
        <>
            {/* <Pressable
                onPress={handlePress}
                className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <EditIcon width={18} height={18} stroke={colors.icon} fillOpacity={0} />
                <Text className='text-base text-foreground'>Edit</Text>
            </Pressable> */}
            <ActionButton
                onPress={handlePress}
                icon={<EditIcon width={18} height={18} stroke={colors.icon} fillOpacity={0} />}
                text='Edit'
            />

            <Sheet enableDynamicSizing={false} ref={editSheetRef} snapPoints={['90']} enableDismissOnClose onDismiss={handleDismiss}>
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