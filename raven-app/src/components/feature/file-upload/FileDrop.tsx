import { useColorModeValue } from "@/ThemeProvider"
import { Box, BoxProps, Center, Stack, Text, useToast } from "@chakra-ui/react"
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
    maxFileSize?: number,
    children?: React.ReactNode
}

/**
 * File uploader component that allows users to drag and drop files or select files from their computer.
 * It encompasses Box component, so all Box props can be used.
 */
export const FileDrop = forwardRef((props: FileDropProps, ref) => {

    const { files, onFileChange, maxFiles, accept, maxFileSize, children, ...compProps } = props
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

    const { borderColor, textColor, bgColor } = useColorModeValue({
        borderColor: "gray.300",
        textColor: "gray.600",
        // Using hex values to add opacity
        bgColor: "#F7FAFCAA"
    }, {
        borderColor: "gray.700",
        textColor: "white",
        bgColor: "#171923AA"
    })

    return (
        <Stack
            w='full'
            h='calc(100vh - 80px)'
            {...getRootProps()}
            {...compProps}>
            {children}

            {(maxFiles === undefined || files.length < maxFiles) &&
                <Center
                    pos='fixed'
                    display={onDragEnter ? "flex" : "none"}
                    w='calc(100vw - var(--sidebar-width) - var(--chakra-space-8))'
                    h='calc(100vh - 80px)'
                    zIndex='9999'
                    top={'14'}
                    border="2px dashed"
                    borderRadius="md"
                    borderColor={borderColor}
                    bgColor={bgColor}
                >
                    <Text fontSize="sm" color={textColor}>Drop your files here. A Raven will pick it up.</Text>
                    <input type='file' style={{ display: 'none' }} {...getInputProps()} />
                </Center>
            }

        </Stack>
    )
})