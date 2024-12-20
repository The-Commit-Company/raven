import ShareButton from "@components/common/ShareButton"
import VideoPlayer from "@components/features/video/VideoPlayer"
import useFileURL from "@hooks/useFileURL"
import { getFileExtension, isVideoFile } from "@raven/lib/utils/operations"
import { Stack, useLocalSearchParams } from "expo-router"
import WebView from "react-native-webview"
import { WebViewSourceUri } from "react-native-webview/lib/WebViewTypes"

const FileViewer = () => {

  const { uri } = useLocalSearchParams() as { uri: string }

  const fileExtension = getFileExtension(uri)

  const isVideo = isVideoFile(fileExtension)


  return (
    <>
      <Stack.Screen options={{
        title: 'Raven',
        headerTitle: `${uri?.split('/').pop()}`,
        headerRight: () => <ShareButton uri={uri} />
      }} />
      {isVideo ?
        <VideoPlayer uri={uri} />
        :
        <FileView uri={uri} />
      }
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