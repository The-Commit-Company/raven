import { IconBaseProps } from 'react-icons'
import { FaRegFilePdf, FaRegFileVideo, FaRegFileWord, FaRegFileExcel, FaRegFileAudio, FaRegFilePowerpoint, FaRegFileImage, FaRegFileAlt } from 'react-icons/fa'


export const imageExt = ["jpeg", "jpg", "png"]

export const excelExt = ['csv', 'xls', 'xlsx']

export const pptExt = ['ppt', 'pptx']

export const wordExt = ['doc', 'docx']

export const videoExt = ['mp4', 'mkv', 'webm', 'avi', 'mov']

export const audioExt = ['mp3', 'wav', 'ogg', 'flac']

interface FileExtensionIconProps extends IconBaseProps {
    ext: string
}
export const FileExtensionIcon = ({ ext, ...props }: FileExtensionIconProps) => {

    const isExcel = excelExt.includes(ext)
    const isImage = imageExt.includes(ext)
    const isWord = wordExt.includes(ext)
    const isPdf = ext === "pdf"
    const isVideo = videoExt.includes(ext)
    const isAudio = audioExt.includes(ext)
    const isPpt = pptExt.includes(ext)

    return <span>
        {isExcel && <FaRegFileExcel size='20' {...props} />}
        {isImage && <FaRegFileImage size='20' {...props} />}
        {isWord && <FaRegFileWord size='20' {...props} />}
        {isPdf && <FaRegFilePdf size='20' {...props} />}
        {isVideo && <FaRegFileVideo size='20' {...props} />}
        {isAudio && <FaRegFileAudio size='20' {...props} />}
        {isPpt && <FaRegFilePowerpoint size='20' {...props} />}
        {!isExcel && !isImage && !isWord && !isPdf && !isAudio && !isPpt && !isVideo && <FaRegFileAlt width='20' {...props} />}
    </span>

}