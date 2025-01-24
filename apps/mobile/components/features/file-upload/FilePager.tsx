import UniversalFileIcon from '@components/common/UniversalFileIcon'
import { CustomFile } from '@raven/types/common/File'
import { View, Text } from 'react-native'
import PagerView from 'react-native-pager-view'

interface FilePagerProps {
    files: CustomFile[]
    setSelectedFile: (file: CustomFile) => void
    fadeIn: () => void
    fadeOut: () => void
    pagerRef: React.RefObject<PagerView>
}

const FilePager = ({ files, setSelectedFile, fadeIn, fadeOut, pagerRef }: FilePagerProps) => {
    return (
        <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={({ nativeEvent }) => {
                setSelectedFile(files[nativeEvent.position])
                fadeIn()
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
        >
            {files.map((file) => {
                if (file.uri) {
                    return (
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
                        </View>
                    )
                }
            })}
        </PagerView >
    )
}

export default FilePager