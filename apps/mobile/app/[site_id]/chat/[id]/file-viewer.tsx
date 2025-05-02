import ShareButton from "@components/common/Buttons/ShareButton"
import { Stack, useLocalSearchParams } from "expo-router"
import HeaderBackButton from "@components/common/Buttons/HeaderBackButton"
import { useColorScheme } from "@hooks/useColorScheme"
import { RenderFile, useFileViewerAttributes } from "@components/features/file-viewer/FileViewerComponents"
import CommonErrorBoundary from "@components/common/CommonErrorBoundary"
import { Platform } from "react-native"

const FileViewer = () => {
  const { uri } = useLocalSearchParams() as { uri: string }
  const { isVideo, isImage, showHeader, handleShowHeader } = useFileViewerAttributes(uri)


  const { colors } = useColorScheme()

  return (
    <>
      <Stack.Screen options={{
        headerStyle: { backgroundColor: colors.background },
        headerLeft: Platform.OS === 'ios' ? () => <HeaderBackButton /> : undefined,
        headerTransparent: isImage,
        title: 'File Viewer',
        headerShown: showHeader,
        headerTitle: `${uri?.split('?')[0]?.split('/').pop()}`,
        headerRight: () => <ShareButton uri={uri} />
      }} />
      <RenderFile uri={uri} handleShowHeader={handleShowHeader} isVideo={isVideo} isImage={isImage} />
    </>
  )
}

export default FileViewer

export const ErrorBoundary = CommonErrorBoundary