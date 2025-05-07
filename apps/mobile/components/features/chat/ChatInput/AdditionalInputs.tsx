import { Button } from "@components/nativewindui/Button"
import { useSheetRef, Sheet } from "@components/nativewindui/Sheet"
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet"
import { View } from "react-native"
import PlusIcon from "@assets/icons/PlusIcon.svg"
import FilePickerButton from "@components/common/Buttons/FilePickerButton"
import ImagePickerButton from "@components/common/Buttons/ImagePickerButton"
import GIFPickerButton from "@components/common/GIFPicker/GIFPickerButton"
import { useKeyboardVisible } from "@hooks/useKeyboardVisible"
import { CustomFile } from "@raven/types/common/File"
import { useSetAtom } from 'jotai'
import { filesAtomFamily } from "@lib/ChatInputUtils"
import CreatePollButton from "@components/common/Buttons/CreatePollButton"
import useSiteContext from "@hooks/useSiteContext"
import { useColorScheme } from "@hooks/useColorScheme"
import CameraButton from "@components/common/Buttons/CameraButton"
import VideoButton from "@components/common/Buttons/VideoButton"

const AdditionalInputs = ({ channelID, onMessageContentSend }: { channelID: string, onMessageContentSend: (content: string) => void }) => {

    const bottomSheetRef = useSheetRef()
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible()

    const { colors } = useColorScheme()

    return (
        <View>
            <Button size='icon' style={{ borderRadius: '100%' }} className="bg-card-background h-8 w-8 mb-1"
                hitSlop={10}
                onPress={() => bottomSheetRef.current?.present()}>
                <PlusIcon fill={colors.grey} width={22} height={22} />
            </Button>
            <Sheet ref={bottomSheetRef} bottomInset={isKeyboardVisible ? keyboardHeight : 0} keyboardBehavior='interactive' keyboardBlurBehavior="restore" android_keyboardInputMode="adjustPan">
                <BottomSheetView className='pb-16'>
                    <AdditionalInputsSheetContent bottomSheetRef={bottomSheetRef} channelID={channelID} onMessageContentSend={onMessageContentSend} />
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

export default AdditionalInputs

const AdditionalInputsSheetContent = ({ bottomSheetRef, channelID, onMessageContentSend }: { bottomSheetRef: React.RefObject<BottomSheetModal>, channelID: string, onMessageContentSend: (content: string) => void }) => {

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

        const content = `<p class="rt-Text text-sm"><img src="${gif.media_formats.gif.url}"><br></p>`
        onMessageContentSend(content)
        onSheetClose()
    }

    const onSheetClose = () => {
        bottomSheetRef.current?.dismiss()
    }

    return (
        <View className="flex-col justify-start items-start px-3 w-full gap-4">
            <View className='flex flex-row gap-4 w-full justify-between'>
                <ImagePickerButton onPick={handlePick} isLarge />
                <CameraButton onPick={handlePick} />
                <VideoButton onPick={handlePick} />
            </View>
            <View className='flex flex-col gap-0'>
                <FilePickerButton onPick={handlePick} />
                <GIFPickerButton onSelect={handleGIFSelect} />
                <CreatePollButton onSheetClose={onSheetClose} />
            </View>
        </View>
    )
}