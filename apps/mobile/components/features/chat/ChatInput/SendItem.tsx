import UniversalFileIcon from "@components/common/UniversalFileIcon"
import { CustomFile } from "@raven/types/common/File"
import { View, Text, ActivityIndicator, Pressable, useWindowDimensions } from "react-native"
import CrossIcon from "@assets/icons/CrossIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { getFileExtension, isImageFile } from "@raven/lib/utils/operations"
import { Image } from "expo-image"
import { COLORS } from "@theme/colors"

const SendItem = ({ file, numberOfFiles, removeFile }: { file: CustomFile, numberOfFiles: number, removeFile: (file: CustomFile) => void }) => {

    const { colors } = useColorScheme()
    const { width } = useWindowDimensions()
    const extension = getFileExtension(file.name)
    const isImage = isImageFile(extension)

    return (
        <View className="relative">
            {isImage ?
                <View>
                    <Image source={{ uri: file.uri }} style={{ width: 64, height: 64, borderRadius: '20%' }} />
                    {file.uploading &&
                        <View className='bg-card absolute left-0 bottom-0 opacity-50 flex items-center justify-center' style={{ width: 64, height: 64, borderRadius: '20%' }}>
                            <ActivityIndicator size='large' color={colors.foreground} className="z-50" />
                        </View>
                    }
                </View>
                :
                <View className='rounded-lg p-2.5 flex-row items-center gap-3 border-border border line-clamp-1' style={{ width: (numberOfFiles > 1 ? width * 0.4 : width * 0.9) }}>
                    {file.uploading &&
                        <View className='bg-card absolute left-0 z-50 bottom-0 opacity-50' style={{ width: 40, height: 40 }}>
                            <ActivityIndicator size='small' color={colors.foreground} className="absolute left-2.5 bottom-3 z-50" />
                        </View>
                    }
                    <UniversalFileIcon fileName={file.name} width={40} height={40} />
                    <View className='flex-col gap-1'>
                        <Text className="line-clamp-1 pr-14 color-foreground">{file.name}</Text>
                        <Text className="text-xs color-grayText">{extension.toUpperCase()}</Text>
                    </View>
                </View>}
            <Pressable hitSlop={10} className="absolute -right-2 -top-2 bg-slate-800 rounded-full p-0.5 border-2 border-background"
                onPress={() => { removeFile(file) }}>
                <CrossIcon color={COLORS.white} width={14} height={14} />
            </Pressable>
        </View>
    )
}

export default SendItem