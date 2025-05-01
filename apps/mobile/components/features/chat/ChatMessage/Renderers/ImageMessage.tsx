import { ImageMessage } from "@raven/types/common/Message";
import { UserFields } from "@raven/types/common/UserFields";
import { View } from "react-native";
import { Image } from "expo-image";
import useFileURL, { UseFileURLReturnType } from "@hooks/useFileURL";
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


    const { source, ...otherAttributes } = useGetImageAttributes(message)

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
        <GestureDetector gesture={singleTapGesture}>
            <View collapsable={false} className='flex-1 pt-0.5' style={{
                width: otherAttributes.width,
                height: otherAttributes.height,
            }}>
                <ImageMessageLayout source={source} {...otherAttributes} />
            </View>
        </GestureDetector>
    )

}

const useGetImageAttributes = (message: ImageMessage) => {
    const source = useFileURL(message.file)
    const { width, height, alt, blurhash } = useMemo(() => {
        const width = message?.thumbnail_width ? message?.thumbnail_width / 2 : 300
        const height = message?.thumbnail_height ? message?.thumbnail_height / 2 : 200
        const alt = `Image file sent by ${message.owner} at ${message.creation}`

        return { width, height, alt, blurhash: message.blurhash }
    }, [message])

    return { source, width, height, alt, blurhash }
}


export const ImageMessageView = ({ message }: { message: ImageMessage }) => {

    const attributes = useGetImageAttributes(message)

    return <View
        className="flex-row items-center pt-1 gap-1"
        style={{
            width: attributes.width,
            height: attributes.height,
        }}
    >
        <ImageMessageLayout {...attributes} />
    </View>


}

const DEFAULT_BLURHASH = 'L1P%O.-;fQ-;~qj[fQj[%MfQfQfQ'

const ImageMessageLayout = ({ source, width, height, alt, blurhash = DEFAULT_BLURHASH }: { source?: UseFileURLReturnType, width: number, height: number, alt: string, blurhash?: string }) => {

    return <View
        className="flex-row items-center gap-1"
        style={{
            width: width,
            height: height,
        }}
    >

        <Image
            source={source}
            style={{
                borderRadius: 8,
                width: width,
                height: height,
            }}
            placeholder={blurhash ? { blurhash, height, width } : undefined}
            contentFit="cover"
            transition={200}
            alt={alt}
        />



    </View>
}