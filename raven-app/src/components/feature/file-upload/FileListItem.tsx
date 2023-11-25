import { Text, Stack, IconButton, HStack, Image, Center, CircularProgress, CircularProgressLabel, } from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
import { useGetFilePreviewUrl } from '../../../hooks/useGetFilePreviewUrl'
import { FileExtensionIcon } from '../../../utils/layout/FileExtensionIcon'
import { getFileExtension } from '../../../utils/operations'
import { CustomFile } from './FileDrop'
import { FileUploadProgress } from '../chat/ChatInput/FileInput/useFileUpload'
import { useColorModeValue } from '@/ThemeProvider'

interface FileListItemProps {
    file: CustomFile,
    removeFile: VoidFunction,
    uploadProgress: Record<string, FileUploadProgress>
}

export const FileListItem = ({ file, removeFile, uploadProgress }: FileListItemProps) => {

    const { borderColor, bgColor } = useColorModeValue({
        borderColor: 'gray.200',
        bgColor: 'white'
    }, {
        borderColor: 'gray.800',
        bgColor: 'gray.900'
    })
    const previewURL = useGetFilePreviewUrl(file)
    const fileSizeString = getFileSize(file)

    const isUploadComplete = uploadProgress?.[file.fileID]?.isComplete ?? false
    const progress = uploadProgress?.[file.fileID]?.progress ?? 0

    return (
        <HStack w='full' justify={'flex-start'} border={'2px'} borderColor={borderColor} bgColor={bgColor} p='2' rounded='md'>
            <Center maxW='50px'>
                {previewURL ? <Image src={previewURL} alt='File preview' boxSize={'32px'} rounded='md' /> : <div>{FileExtensionIcon(getFileExtension(file.name) ?? '')}</div>}
            </Center>
            <HStack justify="space-between" width="calc(100% - 50px)">
                <Stack spacing={0} w='full' whiteSpace="nowrap" overflow="hidden">
                    <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{file.name}</Text>
                    <Text fontSize="2xs" fontStyle="italic" color="gray.400">
                        {fileSizeString}
                    </Text>
                </Stack>
                {!isUploadComplete && progress > 0
                    &&
                    <CircularProgress size='30px' thickness='6px' color='green.500' value={progress}>
                        <CircularProgressLabel>{progress}%</CircularProgressLabel>
                    </CircularProgress>
                }
                {
                    uploadProgress?.[file.fileID] === undefined &&
                    <IconButton
                        onClick={removeFile}
                        size="sm"
                        title='Remove File'
                        variant="ghost"
                        icon={<Trash2 size='16' />}
                        aria-label="Remove File" />
                }
            </HStack>
        </HStack>
    )
}

export const getFileSize = (file: CustomFile) => {
    return file.size / 1000 > 1000 ? <>{(file.size / 1000000).toFixed(2)} MB</> : <>{(file.size / 1000).toFixed(2)} KB</>
}