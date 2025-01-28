import FilePickerButton from "@components/common/FilePickerButton"
import { useColorScheme } from "@hooks/useColorScheme"
import useFileUpload from "@raven/lib/hooks/useFileUpload"
import { CustomFile } from "@raven/types/common/File"
import { useLocalSearchParams, router } from "expo-router"
import { Animated, View, TextInput } from "react-native"
import SendIcon from "@assets/icons/SendIcon.svg"
import AddToQueueIcon from "@assets/icons/AddToQueueIcon.svg"
import { Button } from "@components/nativewindui/Button"

const CaptionInput = ({ files, setFiles, onCaptionChange, selectedFile, opacity }: { files: CustomFile[], setFiles: React.Dispatch<React.SetStateAction<CustomFile[]>>, onCaptionChange: (caption: string) => void, selectedFile: CustomFile, opacity: Animated.Value }) => {

    const { id } = useLocalSearchParams()

    const { uploadFiles, fileUploadProgress } = useFileUpload(id as string)

    const { colors } = useColorScheme()

    const handleSend = () => {
        uploadFiles(files)
        router.back()
    }

    const handleAddFile = (files: CustomFile[]) => {
        setFiles((prevFiles) => {
            return [...prevFiles, ...files]
        })
    }

    return (
        <View className="flex-row items-center justify-center gap-2 pl-4">
            <FilePickerButton onPick={handleAddFile} icon={
                <AddToQueueIcon height={20} width={20} fill={colors.primary} />
            } />
            <View className='border h-10 border-border w-[80%] rounded-lg p-2'>
                <Animated.View style={{
                    opacity: opacity.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0, 1],
                        extrapolate: 'clamp',
                    }),
                    flex: 1,
                }}>
                    <TextInput
                        placeholder='Add a caption...'
                        onChangeText={(caption) => onCaptionChange(caption)}
                        value={selectedFile.caption}
                        className="color-foreground h-full w-full"
                    />
                </Animated.View>
            </View>
            <Button size='icon' variant="tonal"
                onPress={handleSend}
            >
                <SendIcon fill={colors.primary} />
            </Button>
        </View>
    )
}

export default CaptionInput