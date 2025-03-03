import { getFileExtension } from "@raven/lib/utils/operations"
import { SvgProps } from "react-native-svg"
import FileIcon from "@assets/icons/FileIcon.svg"
import DocIcon from "@assets/icons/DocIcon.svg"
import TxtIcon from "@assets/icons/TxtIcon.svg"
import ImageIcon from "@assets/icons/ImageIcon.svg"
import ZipIcon from "@assets/icons/ZipIcon.svg"
import PdfIcon from "@assets/icons/PdfIcon.svg"
import SheetIcon from "@assets/icons/SheetIcon.svg"
import SlideIcon from "@assets/icons/SlideIcon.svg"
import VideoIcon from "@assets/icons/VideoIcon.svg"
import AudioIcon from "@assets/icons/AudioIcon.svg"

interface FileIconProps extends SvgProps {
    fileName: string
}

const UniversalFileIcon = ({ fileName, ...props }: FileIconProps) => {

    const extension = getFileExtension(fileName)

    switch (extension) {
        case 'pdf':
            return <PdfIcon {...props} fill={'#E5484D'} />
        case 'doc':
        case 'docx':
            return <DocIcon {...props} fill={'#8EC8F6'} />
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <SheetIcon {...props} stroke={'#30A46C'} />
        case 'ppt':
        case 'pptx':
        case 'key':
            return <SlideIcon {...props} fill={'#EC9455'} />
        case 'txt':
            return <TxtIcon {...props} fill={'#B8BCBA'} />
        case 'zip':
        case 'rar':
            return <ZipIcon {...props} fill={'#FBE577'} />
        case 'mp3':
            return <AudioIcon {...props} stroke={'#D0CDD7'} />
        case 'mp4':
        case 'webm':
            return <VideoIcon {...props} stroke={'#EAACC3'} />
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <ImageIcon {...props} fill={'#60B3D7'} />
        default:
            return <FileIcon {...props} fill={'#B8BCBA'} />
    }
}

export default UniversalFileIcon