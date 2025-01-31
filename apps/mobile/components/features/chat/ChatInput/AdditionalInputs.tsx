import { Button } from "@components/nativewindui/Button"
import { useSheetRef, Sheet } from "@components/nativewindui/Sheet"
import { BottomSheetView } from "@gorhom/bottom-sheet"
import { useColorScheme } from "@hooks/useColorScheme"
import { View } from "react-native"
import PlusIcon from "@assets/icons/PlusIcon.svg"
import FilePickerButton from "@components/common/FilePickerButton"
import ImagePickerButton from "@components/common/ImagePickerButton"
import GIFPickerButton from "@components/common/GIFPicker/GIFPickerButton"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useKeyboardVisible } from "@hooks/useKeyboardVisible"

const AdditionalInputs = () => {
    const bottomSheetRef = useSheetRef()

    const { colors } = useColorScheme()

    const { bottom } = useSafeAreaInsets()

    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()

    return (
        <View>
            <Button size='icon' variant="tonal" style={{ borderRadius: '100%' }}
                onPress={() => bottomSheetRef.current?.present()}>
                <PlusIcon fill={colors.foreground} />
            </Button>
            <Sheet ref={bottomSheetRef} bottomInset={isKeyboardVisible ? keyboardHeight : bottom} keyboardBehavior='interactive' keyboardBlurBehavior="restore" android_keyboardInputMode="adjustPan">
                <BottomSheetView className='pb-16'>
                    <AdditionalInputsSheetContent />
                </BottomSheetView>
            </Sheet>
        </View >
    )
}

export default AdditionalInputs

const AdditionalInputsSheetContent = () => {
    return (
        <View className="flex-col gap-4 justify-start items-start p-4">
            <FilePickerButton onPick={() => { }} label="Upload files" />
            <ImagePickerButton onPick={() => { }} label="Upload images" />
            <GIFPickerButton onSelect={() => { }} label="Send GIF" />
        </View>
    )
}