import { Text, Stack, IconButton, HStack, Icon, Image, Center, CircularProgress, CircularProgressLabel, useColorMode } from '@chakra-ui/react'
import { TbTrash } from 'react-icons/tb'
import { useGetFilePreviewUrl } from '../../../hooks/useGetFilePreviewUrl'
import { getFileExtensionIcon } from '../../../utils/layout/fileExtensionIcon'
import { getFileExtension } from '../../../utils/operations'
import { CustomFile } from './FileDrop'

interface FileListItemProps {
    file: CustomFile,
    removeFile: VoidFunction,
    isUploading?: boolean,
    uploadProgress?: number
}

export const FileListItem = ({ file, removeFile, isUploading, uploadProgress }: FileListItemProps) => {

    const { colorMode } = useColorMode()
    const previewURL = useGetFilePreviewUrl(file)
    const fileSizeString = getFileSize(file)

    return (
        <HStack w='full' justify={'flex-start'} border={'1px'} borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'} p='2' rounded='md'>
            <Center maxW='50px'>
                {previewURL ? <Image src={previewURL} alt='File preview' boxSize={'30px'} rounded='md' /> : <Icon as={getFileExtensionIcon(getFileExtension(file.name) ?? '')} boxSize="6" />}
            </Center>
            <HStack justify="space-between" width="calc(100% - 50px)">
                <Stack spacing={0} w='full' whiteSpace="nowrap" overflow="hidden">
                    <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{file.name}</Text>
                    <Text fontSize="2xs" fontStyle="italic" color="gray.400">
                        {fileSizeString}
                    </Text>
                </Stack>
                {isUploading
                    ?
                    <CircularProgress size='30px' thickness='6px' color='green.500' value={uploadProgress}>
                        <CircularProgressLabel>{uploadProgress}%</CircularProgressLabel>
                    </CircularProgress>
                    :
                    <IconButton
                        onClick={removeFile}
                        size="sm"
                        title='Remove File'
                        variant="ghost"
                        icon={<TbTrash />}
                        aria-label="Remove File" />
                }
            </HStack>
        </HStack>
    )
}

export const getFileSize = (file: CustomFile) => {
    return file.size / 1000 > 1000 ? <>{(file.size / 1000000).toFixed(2)} MB</> : <>{(file.size / 1000).toFixed(2)} KB</>
}