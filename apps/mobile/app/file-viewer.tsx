import ShareButton from "@components/common/ShareButton"
import VideoPlayer from "@components/features/video/VideoPlayer"
import { getFileExtension, isVideoFile } from "@raven/lib/utils/operations"
import { Stack, useLocalSearchParams } from "expo-router"
import WebView from "react-native-webview"

const FileViewer = () => {

  const { source } = useLocalSearchParams()

  const parsedSource = JSON.parse(source as string)

  const uri = parsedSource?.uri

  const fileExtension = getFileExtension(uri)

  const isVideo = isVideoFile(fileExtension)


  return (
    <>
      <Stack.Screen options={{
        title: 'Raven',
        headerTitle: `${uri?.split('/').pop()}`,
        headerRight: () => <ShareButton uri="https://raven-dev.frappe.cloud/private/files/2013_mustang.jpg" />
      }} />
      {isVideo ?
        <VideoPlayer source={parsedSource} />
        :
        <WebView
          source={parsedSource}
          style={{ flex: 1 }}
        />
      }
    </>
  )
}

export default FileViewer