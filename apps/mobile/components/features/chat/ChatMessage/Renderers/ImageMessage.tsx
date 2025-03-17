import { ImageMessage } from "@raven/types/common/Message";
import { UserFields } from "@raven/types/common/UserFields";
import { View } from "react-native";
import { Image } from "expo-image";
import useFileURL from "@hooks/useFileURL";
import { Gesture, GestureDetector, TapGesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";

interface ImageMessageProps {
    message: ImageMessage,
    user?: UserFields,
    doubleTapGesture: TapGesture
}

export const ImageMessageRenderer = ({ message, doubleTapGesture }: ImageMessageProps) => {

    const source = useFileURL(message.file)
    const width = message?.thumbnail_width ? message?.thumbnail_width / 2 : 300
    const height = message?.thumbnail_height ? message?.thumbnail_height / 2 : 200

    const handleImagePress = useCallback(() => {
        router.push({
            pathname: './file-viewer',
            params: { uri: source?.uri },
        }, {
            relativeToDirectory: true
        })
    }, [source?.uri])

    /** Route to file viewer on single tap - but wait for double tap to fail */
    const singleTapGesture = useMemo(() => {
        return Gesture.Tap()
            .numberOfTaps(1)
            .hitSlop(10)
            .onStart(() => {
                runOnJS(handleImagePress)()
            }).requireExternalGestureToFail(doubleTapGesture)
    }, [handleImagePress, doubleTapGesture])


    return (
        <View
            className="flex-row items-center gap-1"
        >
            <ImageSkeleton width={width} height={height} />
            <GestureDetector gesture={singleTapGesture}>
                <Image
                    source={source}
                    style={{
                        borderRadius: 8,
                        width: width,
                        height: height,
                    }}
                    contentFit="cover"
                    transition={200}
                    alt={`Image file sent by ${message.owner} at ${message.creation}`}
                />
            </GestureDetector>


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