import UniversalFileIcon from "@components/common/UniversalFileIcon"
import { useColorScheme } from "@hooks/useColorScheme"
import { CustomFile } from "@raven/types/common/File"
import { View, Pressable, Animated } from "react-native"
import PagerView from "react-native-pager-view"
import TrashIcon from "@assets/icons/TrashIcon.svg"

interface FileCarouselProps {
    files: CustomFile[]
    setFiles: React.Dispatch<React.SetStateAction<CustomFile[]>>
    selectedFile: CustomFile
    pagerRef: React.RefObject<PagerView>
    opacity: Animated.Value
}

const FileCarousel = ({ files, setFiles, selectedFile, pagerRef, opacity }: FileCarouselProps) => {
    const { colors } = useColorScheme()

    const getUpdatedIndex = (index: number) => {
        if (index - 1 < 0) {
            if (files.length > 2) {
                return 1
            }
            return 0
        }
        return index - 1
    }

    const handleDelete = (file: CustomFile) => {
        const fileIndex = files.findIndex((f) => f.fileID === file.fileID)
        setFiles((prevFiles: CustomFile[]) => prevFiles.filter((f) => f.fileID !== file.fileID))
        pagerRef.current?.setPageWithoutAnimation(getUpdatedIndex(fileIndex))
    }

    if (files.length > 1) {
        return (
            <Animated.View style={{
                opacity: opacity.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0, 1],
                    extrapolate: 'clamp',
                }),
                flex: 1,
            }}>
                <View className="flex-row items-center justify-center gap-2">
                    {files.map((file) => (
                        <Pressable
                            className={`relative ${file.fileID === selectedFile.fileID ? "border-2 border-border rounded-md border-primary dark:border-white p-1" : "border border-border rounded-md p-1"}`}
                            key={file.fileID}
                            onPress={() => pagerRef.current?.setPage(files.findIndex((f) => f.fileID === file.fileID))}
                        >
                            <UniversalFileIcon fileName={file.name} height={30} width={30} />

                            {file.fileID === selectedFile.fileID && (
                                <Pressable
                                    className="absolute inset-0 opacity-60 bg-background rounded-sm flex items-center justify-center z-10"
                                    onPress={() => handleDelete(file)}
                                >
                                    <TrashIcon height={30} width={30} fill={colors.foreground} />
                                </Pressable>
                            )}
                        </Pressable>
                    )
                    )}
                </View>
            </Animated.View>
        )
    }
    return null
}

export default FileCarousel