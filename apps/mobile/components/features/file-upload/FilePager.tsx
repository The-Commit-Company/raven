import UniversalFileIcon from '@components/common/UniversalFileIcon'
import { CustomFile } from '@raven/types/common/File'
import { View, Text, Animated } from 'react-native'
import PagerView from 'react-native-pager-view'
import FileCarousel from './FileCarousel'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useKeyboardVisible } from '@hooks/useKeyboardVisible'
import { useRef } from 'react'

interface FilePagerProps {
    files: CustomFile[]
    setSelectedFile: (file: CustomFile) => void
    pagerRef: React.RefObject<PagerView>
    setFiles: React.Dispatch<React.SetStateAction<CustomFile[]>>
    fadeIn: () => void
    fadeOut: () => void
}

const FilePager = ({ files, setFiles, setSelectedFile, pagerRef, fadeIn, fadeOut }: FilePagerProps) => {

    const { bottom } = useSafeAreaInsets()
    const { isKeyboardVisible } = useKeyboardVisible()

    const opacity = useRef(new Animated.Value(0)).current

    const handlePageScroll = ({ nativeEvent }: { nativeEvent: { position: number, offset: number } }) => {
        const { position, offset } = nativeEvent
        opacity.setValue(offset)
    }

    return (
        <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={({ nativeEvent }) => {
                setSelectedFile(files[nativeEvent.position])
            }}
            onPageScrollStateChanged={({ nativeEvent }) => {
                switch (nativeEvent.pageScrollState) {
                    case 'dragging':
                        fadeOut()
                        break
                    case 'idle':
                        fadeIn()
                        break
                    case 'settling':
                        break
                }
            }}
            onPageScroll={handlePageScroll}
        >
            {files.map((file) => (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    key={file.fileID}
                >
                    <UniversalFileIcon fileName={file.name} height={100} width={100} />
                    <Text className="color-grayText text-center py-2 px-8">{file.name}</Text>
                    <View className="absolute"
                        style={{
                            bottom: isKeyboardVisible ? 0 : bottom,
                        }}>
                        <FileCarousel files={files} pagerRef={pagerRef} selectedFile={file} setFiles={setFiles} opacity={opacity} />
                    </View>
                </View>
            )
            )}
        </PagerView >
    )
}

export default FilePager