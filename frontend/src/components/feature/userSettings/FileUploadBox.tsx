import { Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { FlexProps } from "@radix-ui/themes/dist/cjs/components/flex";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { CustomFile } from "../file-upload/FileDrop";
import { FileUploadProgress } from "../chat/ChatInput/FileInput/useFileUpload";
import { getFileSize } from "../file-upload/FileListItem";
import { useGetFilePreviewUrl } from "@/hooks/useGetFilePreviewUrl";
import { Loader } from "@/components/common/Loader";
import { BiTrash } from "react-icons/bi";

export interface FileUploadBoxProps extends FlexProps {
    /** File to be uploaded */
    file: CustomFile | undefined
    /** Function to set file in parent */
    onFileChange: (file: CustomFile | undefined) => void
    /** Takes input MIME type as 'key' & array of extensions as 'value'; empty array - all extensions supported */
    accept?: Accept
    /** Maximum file size in mb that can be selected */
    maxFileSize?: number
}

export const FileUploadBox = forwardRef((props: FileUploadBoxProps, ref) => {

    const { file, onFileChange, accept, maxFileSize, children, ...compProps } = props
    const [onDragEnter, setOnDragEnter] = useState(false)

    const fileSizeValidator = (file: any) => {
        if (maxFileSize && file.size > maxFileSize * 1000000) {
            toast.error(`Uh Oh! ${file.name} exceeded the maximum file size required.`)
            return {
                code: "size-too-large",
                message: `File size is larger than the required size.`,
            }
        } else return null
    }

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop: (receivedFiles) => {
            if (receivedFiles.length > 0) {
                onFileChange({
                    ...receivedFiles[0],
                    fileID: receivedFiles[0].name + Date.now(),
                    uploadProgress: 0,
                })
            }
        },
        maxFiles: 1,
        accept: accept ? accept : undefined,
        validator: fileSizeValidator,
        noClick: true,
        noKeyboard: true,
        onDragEnter: () => setOnDragEnter(true),
        onDragLeave: () => setOnDragEnter(false),
        onDropAccepted: () => setOnDragEnter(false),
        onDropRejected: () => setOnDragEnter(false),
    })

    useImperativeHandle(ref, () => ({
        openFileInput() {
            open()
        },
    }))

    const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})

    const removeFile = (id: string) => {
        onFileChange(undefined)
        setFileUploadProgress(p => {
            const newProgress = { ...p }
            delete newProgress[id]
            return newProgress
        })
    }

    return (
        <Flex direction="column" pt='2' gap='2' {...getRootProps()} {...compProps}>
            <Flex
                align="center"
                justify="center"
                className={`border-2 border-dashed rounded-md ${onDragEnter ? "border-iris-10" : "border-gray-6 dark:border-gray-700"} dark:bg-[#171923AA] bg-[#F7FAFCAA]`}
                style={{
                    width: "100%",
                    height: "150px",
                }}
                display={"flex"}>
                <Flex gap={'1'}>
                    <Text as="span" size="2" color="gray">
                        Drag and drop your file here or
                    </Text>
                    <Button variant={'ghost'} onClick={open} className={"underline not-cal hover:bg-transparent cursor-pointer"}>
                        choose file
                    </Button>
                </Flex>
                <input type="file" style={{ display: "none" }} {...getInputProps()} />
            </Flex>
            <Flex justify={'between'}>
                <Text as="span" size="1" color="gray">
                    Supported formats: .jpeg, .jpg, .png
                </Text>
                <Text as="span" size="1" color="gray">
                    Maximum file size: 10MB
                </Text>
            </Flex>
            {file && <FileItem file={file} uploadProgress={fileUploadProgress} removeFile={() => removeFile(file.fileID)} />}
        </Flex>
    )
})

interface FileItemProps {
    file: CustomFile,
    removeFile: VoidFunction,
    uploadProgress: Record<string, FileUploadProgress>
}

const FileItem = ({ file, removeFile, uploadProgress }: FileItemProps) => {

    console.log('file', file)

    const previewURL = useGetFilePreviewUrl(file)
    const fileSizeString = getFileSize(file)
    const isUploadComplete = uploadProgress?.[file.fileID]?.isComplete ?? false
    const progress = uploadProgress?.[file.fileID]?.progress ?? 0

    return (
        <Flex width='100%' gap='2' mt='2' px='4' className='border rounded-md border-slate-8' justify={'between'}>

            <Flex align='center' justify='center'>
                <Flex align='center' justify='center' className='w-12 h-12'>
                    {previewURL && <img src={previewURL} alt='File preview' className='w-10 h-10 aspect-square object-cover rounded-md' />}
                </Flex>
                <Flex direction='column' width='100%' className='overflow-hidden whitespace-nowrap'>
                    <Text as="span" size="2" className='overflow-hidden text-ellipsis whitespace-nowrap'>{file.name}</Text>
                    <Text size='1' className='italic' color='gray'>
                        {fileSizeString}
                    </Text>
                </Flex>
            </Flex>

            <Flex align='center' justify='center'>
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
                        color='red'
                        title='Remove File'
                        variant="ghost"
                        aria-label="Remove File">
                        <BiTrash />
                    </IconButton>
                }
            </Flex>
        </Flex>
    )
}
