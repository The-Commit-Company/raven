import { Button } from "@components/nativewindui/Button"
import { useSheetRef, Sheet } from "@components/nativewindui/Sheet"
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet"
import { useColorScheme } from "@hooks/useColorScheme"
import { View } from "react-native"
import PlusIcon from "@assets/icons/PlusIcon.svg"
import FilePickerButton from "@components/common/FilePickerButton"
import ImagePickerButton from "@components/common/ImagePickerButton"
import GIFPickerButton from "@components/common/GIFPicker/GIFPickerButton"
import { useKeyboardVisible } from "@hooks/useKeyboardVisible"
import { CustomFile } from "@raven/types/common/File"
import { useAtom } from 'jotai'
import { filesAtom } from "@lib/filesAtom"
import CreatePollButton from "@components/common/CreatePollButton"

const AdditionalInputs = () => {
    const bottomSheetRef = useSheetRef()

    const { colors } = useColorScheme()

    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()

    return (
        <View>
            <Button size='icon' variant="tonal" style={{ borderRadius: '100%' }}
                onPress={() => bottomSheetRef.current?.present()}>
                <PlusIcon fill={colors.foreground} />
            </Button>
            <Sheet ref={bottomSheetRef} bottomInset={isKeyboardVisible ? keyboardHeight : 0} keyboardBehavior='interactive' keyboardBlurBehavior="restore" android_keyboardInputMode="adjustPan">
                <BottomSheetView className='pb-16'>
                    <AdditionalInputsSheetContent bottomSheetRef={bottomSheetRef} />
                </BottomSheetView>
            </Sheet>
        </View >
    )
}

export default AdditionalInputs

const AdditionalInputsSheetContent = ({ bottomSheetRef }: { bottomSheetRef: React.RefObject<BottomSheetModal> }) => {

    const [, setFiles] = useAtom(filesAtom)

    const handlePick = (files: CustomFile[]) => {
        setFiles((prevFiles) => {
            return [...prevFiles, ...files]
        })
        bottomSheetRef.current?.close()
    }

    return (
        <View className="flex-col gap-4 justify-start items-start p-4">
            <FilePickerButton onPick={handlePick} label="Upload files" />
            <ImagePickerButton onPick={handlePick} label="Upload images" />
            <GIFPickerButton onSelect={() => { }} label="Send GIF" />
            <CreatePollButton label="Create Poll" />
        </View>
    )
}