import { Button, Flex, FlexProps, IconButton, Text } from "@radix-ui/themes";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useGetFilePreviewUrl } from "@/hooks/useGetFilePreviewUrl";
import { Loader } from "@/components/common/Loader";
import { BiTrash, BiPlayCircle, BiPauseCircle } from "react-icons/bi";
import { CustomFile } from "../../file-upload/FileDrop";
import { FileUploadProgress } from "../../chat/ChatInput/FileInput/useFileUpload";
import { getFileSize } from "../../file-upload/FileListItem";
import { __ } from "@/utils/translations";
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon";

export type FileUploadBoxProps = FlexProps & {
    /** File to be uploaded */
    file: CustomFile | undefined
    /** Function to set file in parent */
    onFileChange: (file: CustomFile | undefined) => void
    /** Takes input MIME type as 'key' & array of extensions as 'value'; empty array - all extensions supported */
    accept?: Accept
    /** Maximum file size in mb that can be selected */
    maxFileSize?: number,
    /** Hide the file upload box if the file size limit is reached */
    hideIfLimitReached?: boolean
}

export const FileUploadBox = forwardRef((props: FileUploadBoxProps, ref) => {

    const { file, onFileChange, accept, maxFileSize, children, hideIfLimitReached, ...compProps } = props
    const [onDragEnter, setOnDragEnter] = useState(false)

    const fileSizeValidator = (file: any) => {
        if (maxFileSize && file.size > maxFileSize * 1000000) {
            toast.error(__("Uh Oh! {0} exceeded the maximum file size required.", [file.name]))
            return {
                code: "size-too-large",
                message: __("File size is larger than the required size."),
            }
        } else return null
    }

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop: (receivedFiles: File[]) => {
            if (receivedFiles.length > 0) {
                const f: CustomFile = receivedFiles[0] as CustomFile
                f.uploadProgress = 0
                f.fileID = f.name + Date.now()
                onFileChange(f)
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

    const toHide = hideIfLimitReached && file

    const supportedFormats = accept ? `Supported formats: ${Object.values(accept).flat().join(", ")}` : __("Supported formats: {0}, {1}, {2}", [".jpeg", ".jpg", ".png"])

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
                display={toHide ? "none" : "flex"}>
                <Flex gap={'1'}>
                    <Text as="span" size="2" color="gray">
                        {__("Drag and drop your file here or")}
                    </Text>
                    <Button variant={'ghost'} type='button' onClick={open} className={"underline not-cal hover:bg-transparent cursor-pointer"}>
                        {__("choose file")}
                    </Button>
                </Flex>
                <input type="file" style={{ display: "none" }} {...getInputProps()} />
            </Flex>
            <Flex justify={'between'} display={toHide ? "none" : "flex"}>
                <Text as="span" size="1" color="gray">
                    {supportedFormats}
                </Text>
                <Text as="span" size="1" color="gray">
                    {__("Maximum file size: {0}MB", [maxFileSize])}
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

    const previewURL = useGetFilePreviewUrl(file)
    const fileSizeString = getFileSize(file)
    const isUploadComplete = uploadProgress?.[file.fileID]?.isComplete ?? false
    const progress = uploadProgress?.[file.fileID]?.progress ?? 0

    const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (previewURL && file.type?.startsWith('audio')) {
            const audio = new Audio(previewURL);
            setAudioEl(audio);
            const handleEnded = () => setIsPlaying(false);
            audio.addEventListener('ended', handleEnded);
            return () => {
                audio.pause();
                audio.currentTime = 0;
                audio.removeEventListener('ended', handleEnded);
            };
        }
    }, [previewURL, file.type]);

    const handleTogglePlay = () => {
        if (!audioEl) return;
        if (isPlaying) {
            audioEl.pause();
            setIsPlaying(false);
        } else {
            audioEl.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    return (
        <Flex width='100%' gap='2' mt='2' px='4' py='1' className='border rounded-md border-slate-8' justify={'between'}>

            <Flex align='center' justify='center' gap='2'>
                <Flex align='center' justify='center' className='w-12 h-12'>
                    {file.type?.startsWith('audio') ? (
                        <IconButton
                            variant="ghost"
                            color="blue"
                            title={isPlaying ? 'Pause Audio' : 'Play Audio'}
                            onClick={handleTogglePlay}
                            size="3"
                        >
                            {isPlaying ? <BiPauseCircle size={24} /> : <BiPlayCircle size={24} />}
                        </IconButton>
                        ) : previewURL ? (
                        <img src={previewURL} alt="File preview" className='w-10 h-10 aspect-square object-cover rounded-md' />
                        ) : <FileExtensionIcon ext={file.name.split('.').pop() ?? ''} size='24' />}
                </Flex>
                <Flex direction='column' width='100%' className='overflow-hidden whitespace-nowrap gap-0.5'>
                    <Text as="span" size="2" className='overflow-hidden text-ellipsis whitespace-nowrap'>{file.name}</Text>
                    <Text size='1' color='gray'>
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
