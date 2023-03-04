import { Box, BoxProps, Stack, Text, useToast } from "@chakra-ui/react"
import { forwardRef, useImperativeHandle, useState } from "react"
import { Accept, useDropzone } from "react-dropzone"

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
export const FileDrop = forwardRef((props: FileDropProps, ref) => {

    const { files, onFileChange, maxFiles, accept, maxFileSize, ...compProps } = props
    const toast = useToast()

    const [onDragEnter, setOnDragEnter] = useState(false)

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

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop: (receivedFiles, fileRejections) => {
            onFileChange([...files, ...receivedFiles.map((file) => Object.assign(file, {
                fileID: file.name + Date.now(),
                uploadProgress: 0
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
        validator: fileSizeValidator,
        noClick: true,
        noKeyboard: true,
        onDragEnter: () => setOnDragEnter(true),
        onDragLeave: () => setOnDragEnter(false),
        onDropAccepted: () => setOnDragEnter(false),
        onDropRejected: () => setOnDragEnter(false)
    })

    useImperativeHandle(ref, () => ({
        openFileInput() {
            open()
        }
    }));

    return (
        <Stack pos='fixed' top='75px' w='full' h='70vh' maxW='calc(100vw - var(--sidebar-width) - 30px)'>
            {(maxFiles === undefined || files.length < maxFiles) &&
                <Box
                    display="flex"
                    w='full'
                    h='full'
                    justifyContent="center"
                    alignItems="center"
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="lg"
                    opacity={onDragEnter ? 1 : 0}
                    p={4}
                    {...getRootProps()}
                    {...compProps}>
                    <input type='file' {...getInputProps()} />
                    <Text fontSize="sm" color="gray.500">Drag 'n' drop your files here, or click to select files</Text>
                </Box>
            }
        </Stack>
    )
})