import { Button } from "@components/nativewindui/Button"
import { useSheetRef, Sheet } from "@components/nativewindui/Sheet"
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet"
import { View } from "react-native"
import PlusIcon from "@assets/icons/PlusIcon.svg"
import FilePickerButton from "@components/common/FilePickerButton"
import ImagePickerButton from "@components/common/ImagePickerButton"
import GIFPickerButton from "@components/common/GIFPicker/GIFPickerButton"
import { useKeyboardVisible } from "@hooks/useKeyboardVisible"
import { CustomFile } from "@raven/types/common/File"
import { useSetAtom } from 'jotai'
import { filesAtomFamily } from "@lib/filesAtom"
import CreatePollButton from "@components/common/CreatePollButton"
import useSiteContext from "@hooks/useSiteContext"

const AdditionalInputs = ({ channelID }: { channelID: string }) => {

    const bottomSheetRef = useSheetRef()
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()

    return (
        <View>
            <Button size='icon' style={{ borderRadius: '100%' }} className="h-8 w-8"
                hitSlop={10}
                onPress={() => bottomSheetRef.current?.present()}>
                <PlusIcon fill={"#FFF"} />
            </Button>
            <Sheet ref={bottomSheetRef} bottomInset={isKeyboardVisible ? keyboardHeight : 0} keyboardBehavior='interactive' keyboardBlurBehavior="restore" android_keyboardInputMode="adjustPan">
                <BottomSheetView className='pb-16'>
                    <AdditionalInputsSheetContent bottomSheetRef={bottomSheetRef} channelID={channelID} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

export default AdditionalInputs

const AdditionalInputsSheetContent = ({ bottomSheetRef, channelID }: { bottomSheetRef: React.RefObject<BottomSheetModal>, channelID: string }) => {

    const siteInfo = useSiteContext()
    const siteID = siteInfo?.sitename ?? ''

    const setFiles = useSetAtom(filesAtomFamily(siteID + channelID))

    const handlePick = (files: CustomFile[]) => {
        setFiles((prevFiles) => {
            return [...prevFiles, ...files]
        })
        onSheetClose()
    }

    const handleGIFSelect = (gif: any) => {
        console.log(gif)
    }

    const onSheetClose = () => {
        bottomSheetRef.current?.close()
    }

    return (
        <View className="flex-col justify-start items-start px-3 w-full">
            <FilePickerButton onPick={handlePick} />
            <ImagePickerButton onPick={handlePick} />
            <GIFPickerButton onSelect={handleGIFSelect} />
            <CreatePollButton onSheetClose={onSheetClose} />
        </View>
    )
}