import UniversalFileIcon from "@components/common/UniversalFileIcon"
import { useColorScheme } from "@hooks/useColorScheme"
import { CustomFile } from "@raven/types/common/File"
import { View, Pressable } from "react-native"
import PagerView from "react-native-pager-view"
import TrashIcon from "@assets/icons/TrashIcon.svg"

interface FileCarouselProps {
    files: CustomFile[]
    setFiles: React.Dispatch<React.SetStateAction<CustomFile[]>>
    selectedFile: CustomFile
    pagerRef: React.RefObject<PagerView>
}

const FileCarousel = ({ files, setFiles, selectedFile, pagerRef }: FileCarouselProps) => {
    const { colors } = useColorScheme()
    if (files.length > 1) {
        return (
            <View className="flex-row items-center justify-center gap-2">
                {files.map((file) => {
                    if (file.uri) {
                        return (
                            <Pressable
                                className={`relative ${file.fileID === selectedFile.fileID ? "border-2 border-border rounded-md border-primary dark:border-white p-1" : "border border-border rounded-md p-1"}`}
                                key={file.fileID}
                                onPress={() => pagerRef.current?.setPage(files.findIndex((f) => f.fileID === file.fileID))}
                            >
                                <UniversalFileIcon fileName={file.name} height={30} width={30} />

                                {file.fileID === selectedFile.fileID && (
                                    <Pressable
                                        className="absolute inset-0 opacity-60 bg-background rounded-sm flex items-center justify-center z-10"
                                        onPress={() => {
                                            setFiles((prevFiles: CustomFile[]) => prevFiles.filter((f) => f.fileID !== file.fileID));
                                        }}
                                    >
                                        <TrashIcon height={30} width={30} fill={colors.foreground} />
                                    </Pressable>
                                )}
                            </Pressable>
                        )
                    }
                })}
            </View>
        )
    }
    return <View className="p-4" />
}

export default FileCarousel