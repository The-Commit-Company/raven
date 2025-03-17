import UniversalFileIcon from "@components/common/UniversalFileIcon"
import { CustomFile } from "@raven/types/common/File"
import { View, Text, ActivityIndicator } from "react-native"
import { Button } from "@components/nativewindui/Button"
import CrossIcon from "@assets/icons/CrossIcon.svg"
import { useColorScheme } from "@hooks/useColorScheme"
import { getFileExtension, isImageFile } from "@raven/lib/utils/operations"
import { Image } from "expo-image"

const SendItem = ({ file, numberOfFiles, removeFile }: { file: CustomFile, numberOfFiles: number, removeFile: (file: CustomFile) => void }) => {

    const { colors } = useColorScheme()
    const extension = getFileExtension(file.name)
    const isImage = isImageFile(extension)

    return (
        <View className="relative">
            {isImage ?
                <View>
                    <Image source={{ uri: file.uri }} style={{ width: 50, height: 50, borderRadius: '20%' }} />
                    {file.uploading &&
                        <View className='bg-card absolute left-0 bottom-0 opacity-50' style={{ width: 50, height: 50, borderRadius: '20%' }}>
                            <ActivityIndicator size='large' color={colors.foreground} className="absolute left-2 bottom-1.5 z-50" />
                        </View>
                    }
                </View>
                :
                <View className='bg-card rounded-lg py-1 flex-row items-center gap-2 border-border border line-clamp-1' style={{ width: (numberOfFiles > 1 ? 200 : 350) }}>
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
            <Button size='none' variant='primary' className="absolute right-0 top-0 mt-[-8px] mr-[-8px] bg-foreground border-card border-2" style={{ borderRadius: '100%' }}
                onPress={() => {
                    removeFile(file)
                }
                }>
                <CrossIcon fill={colors.card} stroke={colors.card} width={14} height={14} />
            </Button>
        </View>
    )
}

export default SendItem