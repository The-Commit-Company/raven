import ErrorBanner from "@components/common/ErrorBanner";
import useFileURL from "@hooks/useFileURL";
import { useWindowDimensions, Image, View } from "react-native";
import { fitContainer, ResumableZoom, Source, useImageResolution } from "react-native-zoom-toolkit";

interface ImageViewerProps {
    uri: string
    handleShowHeader: VoidFunction
}

const ImageViewer = ({ uri, handleShowHeader }: ImageViewerProps) => {
    console.log('ImageViewer', uri)
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
        console.log('isFetching', isFetching)
        console.log('resolution', resolution)
        return <View className="p-2">
            {error && <ErrorBanner error={error} />}
        </View>
    }

    const size = fitContainer(resolution.width / resolution.height, {
        width,
        height,
    })

    return (
        <ResumableZoom maxScale={resolution} onTap={handleShowHeader}>
            <Image source={source} style={{ ...size }} resizeMethod={'scale'} />
        </ResumableZoom>
    )
}
