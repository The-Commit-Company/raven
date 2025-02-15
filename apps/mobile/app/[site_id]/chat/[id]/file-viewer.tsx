import ShareButton from "@components/common/ShareButton"
import VideoPlayer from "@components/features/video/VideoPlayer"
import useFileURL from "@hooks/useFileURL"
import { getFileExtension, isImageFile, isVideoFile } from "@raven/lib/utils/operations"
import { Stack, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import WebView from "react-native-webview"
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes"
import ImageViewer from "@components/features/image/ImageViewer"
import HeaderBackButton from "@components/common/HeaderBackButton"

const FileViewer = () => {

  const { uri } = useLocalSearchParams() as { uri: string }

  const [showHeader, setShowHeader] = useState(true)

  const fileExtension = getFileExtension(uri)

  const isVideo = isVideoFile(fileExtension)

  const isImage = isImageFile(fileExtension)

  const handleShowHeader = () => {
    setShowHeader((prev) => !prev)
  }

  const renderFile = () => {
    if (isVideo) {
      return <VideoPlayer uri={uri} />
    }
    else if (isImage) {
      return <ImageViewer uri={uri} handleShowHeader={handleShowHeader} />
    }
    return <FileView uri={uri} />
  }

  return (
    <>
      <Stack.Screen options={{
        headerLeft: () => <HeaderBackButton />,
        headerTransparent: isImage,
        title: 'File Viewer',
        headerShown: showHeader,
        headerTitle: `${uri?.split('/').pop()}`,
        headerRight: () => <ShareButton uri={uri} />
      }} />
      {renderFile()}
    </>
  )
}

const FileView = ({ uri }: { uri: string }) => {
  const source = useFileURL(uri)

  return (
    <WebView
      source={source as WebViewSourceUri}
      style={{ flex: 1 }}
    />
  )
}


export default FileViewer