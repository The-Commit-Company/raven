import ErrorBanner from "@components/common/ErrorBanner";
import useFileURL from "@hooks/useFileURL";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { fitContainer, ResumableZoom, Source, useImageResolution } from "react-native-zoom-toolkit";
import { Image } from "expo-image";

interface ImageViewerProps {
    uri: string
    handleShowHeader: VoidFunction
}

const ImageViewer = ({ uri, handleShowHeader }: ImageViewerProps) => {
    const source = useFileURL(uri)
    if (!source) {
        return <View className="p-2">
            <ErrorBanner message="Something went wrong" heading="Couldn't open image" />
        </View>
    }
    return (
        <ImageComponent source={source} handleShowHeader={handleShowHeader} />
    )
}

export default ImageViewer

const ImageComponent = ({ source, handleShowHeader }: { source: Source, handleShowHeader: VoidFunction }) => {

    const { width, height } = useWindowDimensions()
    const { isFetching, resolution, error } = useImageResolution(source)
    if (isFetching || resolution === undefined || error) {
        return <View className="p-2">
            {error && <ErrorBanner error={error} />}
        </View>
    }

    const size = fitContainer(resolution.width / resolution.height, {
        width,
        height,
    })

    const backSwipe = (direction: string) => {
        if (direction === 'right') {
            router.back()
        }
    }

    return (
        <ResumableZoom extendGestures maxScale={resolution} onTap={handleShowHeader} onSwipe={backSwipe}>
            <Image source={source} style={{ ...size }} contentFit="contain" enableLiveTextInteraction />
        </ResumableZoom>
    )
}
