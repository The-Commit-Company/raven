import { BiTrash } from 'react-icons/bi'
import { useGetFilePreviewUrl } from '../../../hooks/useGetFilePreviewUrl'
import { FileExtensionIcon } from '../../../utils/layout/FileExtIcon'
import { getFileExtension } from '../../../utils/operations'
import { CustomFile } from './FileDrop'
import { FileUploadProgress } from '../chat/ChatInput/FileInput/useFileUpload'
import { IconButton, Flex, Text } from '@radix-ui/themes'
import { Loader } from '@/components/common/Loader'

interface FileListItemProps {
    file: CustomFile,
    removeFile: VoidFunction,
    uploadProgress: Record<string, FileUploadProgress>
}

export const FileListItem = ({ file, removeFile, uploadProgress }: FileListItemProps) => {

    const previewURL = useGetFilePreviewUrl(file)
    const fileSizeString = getFileSize(file)

    const isUploadComplete = uploadProgress?.[file.fileID]?.isComplete ?? false
    const progress = uploadProgress?.[file.fileID]?.progress ?? 0

    return (
        <Flex width='100%' justify={'start'} gap='2' className='border rounded-md border-slate-8 dark:bg-slate-5 bg-slate-2' px='1' py='1'>
            <Flex align='center' justify='center' className='w-12 h-12'>
                {previewURL ? <img src={previewURL} alt='File preview' className='w-10 h-10 aspect-square object-cover rounded-md' /> : <FileExtensionIcon ext={getFileExtension(file.name)} className='h-10' />}
            </Flex>
            <Flex justify="between" className='w-48' align='center'>
                <Flex direction='column' width='100%' pr='2' className='overflow-hidden whitespace-nowrap'>
                    <Text as="span" size="2" className='overflow-hidden text-ellipsis whitespace-nowrap'>{file.name}</Text>
                    <Text size='1' className='italic' color='gray'>
                        {fileSizeString}
                    </Text>
                </Flex>
                <Flex height='100%' align='center' justify='center'>
                    {!isUploadComplete && progress > 0
                        &&
                        <Flex align='center' gap='1'>
                            <Loader />
                            <Text size='1' color='gray' className='w-[4.5ch] tabular-nums'>{progress}%</Text>
                        </Flex>
                    }
                    {
                        uploadProgress?.[file.fileID] === undefined &&
                        <IconButton
                            onClick={removeFile}
                            size="1"
                            mx='1'
                            color='red'
                            title='Remove File'
                            variant="ghost"
                            aria-label="Remove File">
                            <BiTrash />
                        </IconButton>
                    }
                </Flex>
            </Flex>
        </Flex>
    )
}

export const getFileSize = (file: CustomFile) => {
    return file.size / 1000 > 1000 ? <>{(file.size / 1000000).toFixed(2)} MB</> : <>{(file.size / 1000).toFixed(2)} KB</>
}