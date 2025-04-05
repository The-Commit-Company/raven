import { getFileExtension } from "@raven/lib/utils/operations"
import { SvgProps } from "react-native-svg"
import FileIcon from "@assets/icons/FileIcon.svg"
import DocIcon from "@assets/icons/DocIcon.svg"
import TxtIcon from "@assets/icons/TxtIcon.svg"
import ImageIcon from "@assets/icons/ImageIcon.svg"
import ZipIcon from "@assets/icons/ZipIcon.svg"
import PdfIcon from "@assets/icons/PdfIcon.svg"
import SlideIcon from "@assets/icons/SlideIcon.svg"
import VideoIcon from "@assets/icons/VideoIcon.svg"
import AudioIcon from "@assets/icons/AudioIcon.svg"
import ExcelIcon from "@assets/icons/ExcelIcon.svg"
import { View } from "react-native"
interface FileIconProps extends SvgProps {
    fileName: string
}

const UniversalFileIcon = ({ fileName, ...props }: FileIconProps) => {

    const extension = getFileExtension(fileName)

    switch (extension) {
        case 'pdf':
            return <View style={{
                backgroundColor: '#E5484D',
                borderRadius: 4,
            }}><PdfIcon {...props} fill={'#FFFFFF'} />
            </View>
        case 'doc':
        case 'docx':
            return <View style={{
                backgroundColor: '#2B7CD3',
                borderRadius: 4,
            }}><DocIcon {...props} fill={'#FFFFFF'} />
            </View>
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <View style={{
                backgroundColor: '#0F9D58',
                borderRadius: 4,
            }}><ExcelIcon {...props} fill={'#FFFFFF'} />
            </View>
        case 'ppt':
        case 'pptx':
        case 'key':
            return <SlideIcon {...props} fill={'#ED6C47'} />
        case 'txt':
            return <TxtIcon {...props} fill={'#B8BCBA'} />
        case 'zip':
        case 'rar':
        case 'gzip':
            return <ZipIcon {...props} fill="#FFA700" />
        case 'mp3':
        case 'wav':
            return <AudioIcon {...props} stroke={'#F6870F'} />
        case 'mp4':
        case 'webm':
            return <View style={{
                backgroundColor: '#7133EA',
                borderRadius: 4,
            }}><VideoIcon {...props} fill={'#FFFFFF'} />
            </View>
        case 'jpg':
        case 'jpeg':
        case 'png':
            return <ImageIcon {...props} fill={'#B8BCBA'} />
        default:
            return <FileIcon {...props} fill={'#B8BCBA'} />
    }
}

export default UniversalFileIcon