import { CheckIcon } from '@chakra-ui/icons'
import { ListItem, Text, Stack, IconButton, HStack, ListIcon, ListItemProps, Image, Center, CircularProgress, CircularProgressLabel } from '@chakra-ui/react'
import { FiFile } from 'react-icons/fi'
import { TbTrash } from 'react-icons/tb'
import { useGetFilePreviewUrl } from '../../../hooks/useGetFilePreviewUrl'
import { CustomFile } from './FileDrop'

interface FileListItemProps extends ListItemProps {
    file: CustomFile,
    removeFile: VoidFunction,
    isUploading?: boolean,
    uploadProgress?: number
}

export const FileListItem = ({ file, removeFile, isUploading, uploadProgress, ...props }: FileListItemProps) => {

    const previewURL = useGetFilePreviewUrl(file)
    const fileSizeString = getFileSize(file)

    return (
        <ListItem display="flex" flex-direction="row" px="2" py="2" width="full" alignItems="center" fontSize="sm" {...props}>
            <HStack w='full' justify={'flex-start'}>
                <Center pr='4' maxW='50px'>
                    {previewURL ? <Image src={previewURL} alt='File preview' boxSize={'30px'} rounded='md' /> : <ListIcon as={FiFile} boxSize="6" />}
                </Center>
                <HStack justify="space-between" width="calc(100% - 50px)">
                    <Stack spacing={0} w='full' whiteSpace="nowrap" overflow="hidden">
                        <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{file.name}</Text>
                        <Text fontSize="xs" fontStyle="italic" color="gray.400">
                            {fileSizeString}
                        </Text>
                    </Stack>
                    {isUploading
                        ?
                        <CircularProgress size='40px' thickness='8px' color='green.500' value={uploadProgress}>
                            <CircularProgressLabel>{uploadProgress}%</CircularProgressLabel>
                        </CircularProgress>
                        :
                        uploadProgress === 100 ? <CheckIcon color='green' /> : <IconButton onClick={removeFile} size="md" title='Remove File' colorScheme="red" variant="ghost" icon={<TbTrash />} aria-label="Remove File" />
                    }
                </HStack>
            </HStack>
        </ListItem>
    )
}

export const getFileSize = (file: CustomFile) => {
    return file.size / 1000 > 1000 ? <>{(file.size / 1000000).toFixed(2)} MB</> : <>{(file.size / 1000).toFixed(2)} KB</>
}