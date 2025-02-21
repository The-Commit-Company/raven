import { ImageMessage } from "@raven/types/common/Message";
import { UserFields } from "@raven/types/common/UserFields";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import useFileURL from "@hooks/useFileURL";
import { router } from "expo-router";

interface ImageMessageProps {
    message: ImageMessage,
    user?: UserFields,
    // Do not load image when scrolling
    isScrolling?: boolean
    onLongPress?: () => void
}
// TODO: Use isScrolling when we want to show the ImageSkeleton
export const ImageMessageRenderer = ({ message, onLongPress, isScrolling = false }: ImageMessageProps) => {

    const source = useFileURL(message.file)
    const width = message?.thumbnail_width ? message?.thumbnail_width / 2 : 300
    const height = message?.thumbnail_height ? message?.thumbnail_height / 2 : 200

    const handleImagePress = () => {
        router.push({
            pathname: './file-viewer',
            params: { uri: source?.uri },
        }, {
            relativeToDirectory: true
        })
    }

    return (
        <View
            className="flex-row items-center gap-1"
        >
            <ImageSkeleton width={width} height={height} />

            <Pressable
                onPress={handleImagePress}
                onLongPress={onLongPress}
            >
                <Image
                    source={source}
                    style={{
                        width: width,
                        height: height,
                    }}
                    contentFit="cover"
                    transition={200}
                    alt={`Image file sent by ${message.owner} at ${message.creation}`}
                    cachePolicy='memory-disk'
                />
            </Pressable>

        </View>
    )

}



const ImageSkeleton = ({ width, height }: { width: number, height: number }) => {
    return (
        <View
            className="absolute top-0 z-0 left-0"
            style={{
                height: height,
                width: width,
            }}
        >
            <View
                className="bg-gray-3 z-0 dark:bg-gray-5 rounded-md"
                style={{
                    height: height,
                    width: width,
                }}
            />
        </View>
    )
}