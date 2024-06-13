import { useMemo } from 'react'
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

const getFileType = (ext: string) => {
    switch (ext) {
        case 'pdf': return 'pdf'
        case 'doc': return 'word'
        case 'docx': return 'word'
        case 'xls': return 'excel'
        case 'xlsx': return 'excel'
        case 'ppt': return 'powerpoint'
        case 'pptx': return 'powerpoint'
        case 'mp3': return 'audio'
        case 'wav': return 'audio'
        case 'ogg': return 'audio'
        case 'flac': return 'audio'
        case 'mp4': return 'video'
        case 'mkv': return 'video'
        case 'webm': return 'video'
        case 'avi': return 'video'
        case 'mov': return 'video'
        case 'jpeg': return 'image'
        case 'jpg': return 'image'
        case 'png': return 'image'
        default: return 'file'
    }
}
export const FileExtensionIcon = ({ ext, ...props }: FileExtensionIconProps) => {

    const fileType = useMemo(() => getFileType(ext), [ext])

    return <span>
        {fileType === 'excel' && <FaRegFileExcel size='20' {...props} />}
        {fileType === 'image' && <FaRegFileImage size='20' {...props} />}
        {fileType === 'word' && <FaRegFileWord size='20' {...props} />}
        {fileType === 'pdf' && <FaRegFilePdf size='20' {...props} />}
        {fileType === 'video' && <FaRegFileVideo size='20' {...props} />}
        {fileType === 'audio' && <FaRegFileAudio size='20' {...props} />}
        {fileType === 'powerpoint' && <FaRegFilePowerpoint size='20' {...props} />}
        {fileType === 'file' && <FaRegFileAlt size='20' {...props} />}
    </span>

}