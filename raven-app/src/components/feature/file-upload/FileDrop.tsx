import { useToast } from "@/hooks/useToast"
import { Flex, Text } from "@radix-ui/themes"
import { FlexProps } from "@radix-ui/themes/dist/cjs/components/flex"
import { forwardRef, useImperativeHandle, useState } from "react"
import { Accept, useDropzone } from "react-dropzone"

export interface CustomFile extends File {
    fileID: string,
    uploading?: boolean,
    uploadProgress?: number
}

export interface FileDropProps extends FlexProps {
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
    const { toast } = useToast()

    const [onDragEnter, setOnDragEnter] = useState(false)

    const fileSizeValidator = (file: any) => {
        if (maxFileSize && file.size > maxFileSize * 1000000) {
            toast({
                title: `Uh Oh! ${file.name} exceeded the maximum file size required.`,
                variant: 'destructive',
                duration: 2500
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
                    variant: 'destructive',
                    duration: 1800,
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
        <Flex
            direction='column'
            style={{
                height: 'calc(100vh - 80px)',
            }}
            width='100%'
            {...getRootProps()}
            {...compProps}>
            {children}

            {(maxFiles === undefined || files.length < maxFiles) &&
                <Flex
                    align='center'
                    justify='center'
                    className="fixed top-14 border-2 border-dashed rounded-md border-gray-6 dark:bg-[#171923AA] bg-[#F7FAFCAA]"
                    style={{
                        width: 'calc(100vw - var(--sidebar-width) - var(--space-8))',
                        height: 'calc(100vh - 80px)',
                        zIndex: 9999
                    }}
                    display={onDragEnter ? "flex" : "none"}
                >
                    <Text as='span' size='2' color='gray'>Drop your files here. A Raven will pick it up.</Text>
                    <input type='file' style={{ display: 'none' }} {...getInputProps()} />
                </Flex>
            }

        </Flex>
    )
})