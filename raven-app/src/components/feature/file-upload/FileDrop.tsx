import { Box, BoxProps, HStack, List, Stack, StackDivider, Text, useToast } from "@chakra-ui/react"
import { Accept, useDropzone } from "react-dropzone"
import { FileListItem } from "./FileListItem"

export interface CustomFile extends File {
    fileID: string,
    uploading?: boolean,
    uploadProgress?: number
}

export interface FileDropProps extends BoxProps {
    /** Array of files */
    files: CustomFile[],
    /** Function to set files in parent */
    onFileChange: (files: CustomFile[]) => void,
    /** Option to show the list of files below the dropzone, Default: true */
    showList?: boolean,
    /** Maximum no. of files that can be selected */
    maxFiles?: number,
    /** Takes input MIME type as 'key' & array of extensions as 'value'; empty array - all extensions supported */
    accept?: Accept,
    /** Maximum file size in mb that can be selected */
    maxFileSize?: number
}

/**
 * File uploader component that allows users to drag and drop files or select files from their computer.
 * It encompasses Box component, so all Box props can be used.
 */
export const FileDrop = ({ files, onFileChange, maxFiles, accept, showList = true, maxFileSize, ...props }: FileDropProps) => {

    const toast = useToast()

    const fileSizeValidator = (file: any) => {
        if (maxFileSize && file.size > maxFileSize * 1000000) {
            toast({
                title: `Uh Oh! ${file.name} exceeded the maximum file size required.`,
                status: 'warning',
                position: 'top',
                duration: 2500,
                isClosable: true
            })
            return {
                code: "size-too-large",
                message: `File size is larger than the required size.`
            }
        } else return null
    }

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (receivedFiles, fileRejections) => {
            onFileChange([...files, ...receivedFiles.map((file) => Object.assign(file, {
                fileID: file.name + Date.now()
            }))])

            if (maxFiles && maxFiles < fileRejections.length) {
                toast({
                    title: `Uh Oh! Maximum ${maxFiles} files can be uploaded. Please try again.`,
                    status: "warning",
                    position: "top",
                    duration: 1800,
                    isClosable: true,
                })
            }
        },
        maxFiles: maxFiles ? maxFiles : 0,
        accept: accept ? accept : undefined,
        validator: fileSizeValidator
    })

    const removeFile = (id: string) => {
        let newFiles = files.filter(file => file.fileID !== id)
        onFileChange(newFiles)
    }

    return (
        <Stack>
            {(maxFiles === undefined || files.length < maxFiles) &&
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    border="2px dashed"
                    borderRadius="lg"
                    cursor="pointer"
                    p={4}
                    {...getRootProps()}
                    {...props}>
                    <input type='file' {...getInputProps()} />
                    <Text fontSize="sm" color="gray.500">Drag 'n' drop your files here, or click to select files</Text>
                </Box>
            }
            {showList && files.length > 0 &&
                <List size="sm" as={HStack} divider={<StackDivider />}>
                    {files.map((f: CustomFile) => <FileListItem key={f.fileID} file={f} isUploading={f.uploading} uploadProgress={f.uploadProgress} removeFile={() => removeFile(f.fileID)} />)}
                </List>
            }
        </Stack>
    )
}