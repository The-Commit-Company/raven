import { useAtomValue } from 'jotai'
import { uploadingFilesAtom, uploadedFilesAtom, useAttachFile, useRemoveFile } from './useFileInput'
import { Button } from '@components/ui/button'
import { AlertCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import FileTypeIcon from '@components/common/FileIcons/FileTypeIcon'
import { formatBytes, getFileExtension } from '@raven/lib/utils/operations'
import { ProgressCircle } from '@components/ui/circular-progress'

type InputFilesProps = {
    channelID: string
}

export const InputFileList = ({ channelID }: InputFilesProps) => {

    const uploadingFiles = useAtomValue(uploadingFilesAtom(channelID))
    const uploadedFiles = useAtomValue(uploadedFilesAtom(channelID))

    const files = useMemo(() => {

        const f: FileItemType[] = [...uploadingFiles]

        uploadedFiles.forEach(file => {
            f.push({
                ...file,
                status: 'uploaded' as const
            })
        })

        return f.sort((a, b) => a.timestamp - b.timestamp)

    }, [uploadingFiles, uploadedFiles])

    return (
        <div className='flex gap-2 flex-wrap'>
            {files.map((file) => (
                <FileItem key={file.id} file={file} channelID={channelID} />
            ))}
        </div>
    )
}

interface FileItemType {
    id: string,
    fileName: string,
    size: number,
    timestamp: number,
    uploadProgress?: number,
    status: 'uploading' | 'uploaded' | 'error',
    fileID?: string,
    fileURL?: string,
}

const FileItem = ({ file, channelID }: { file: FileItemType, channelID: string }) => {

    const onRemoveFile = useRemoveFile(channelID)

    const extension = getFileExtension(file.fileName)

    const onRemoveClick = () => {
        if (file.fileID) {
            onRemoveFile(file.fileID)
        }
    }

    return <div className="rounded-lg border border-gray-200 dark:border-gray-200 min-w-64">
        <div className="flex items-center gap-2 p-2">
            <div className="flex-shrink-0">
                <FileTypeIcon fileType={extension} size="sm" />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-900 dark:text-gray-900 truncate">
                    {file.fileName}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatBytes(file.size)}
                </p>
            </div>
            {/* When the file is being uploaded, show a circular progress bar and when it's uploaded show the delete button */}
            <div className="flex items-center size-9 justify-center">
                {file.status === 'uploading' &&
                    <div className='flex items-center justify-center size-9'>
                        <ProgressCircle value={file.uploadProgress ?? 0} className='text-green-500' />
                    </div>}
                {file.status === 'uploaded' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRemoveClick}
                        title="Remove File"
                    >
                        <Trash2Icon />
                    </Button>
                )}
                {file.status === 'error' && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRemoveClick}
                        title="Remove File"
                    >
                        <AlertCircleIcon className='text-destructive' />
                    </Button>
                )}
            </div>
        </div>
    </div>
}

/** Temp component */
export const AddFileButton = ({ channelID }: { channelID: string }) => {

    const fileInputRef = useRef<HTMLInputElement>(null)

    const onAddFile = useAttachFile(channelID)

    const onClick = () => {
        fileInputRef.current?.click()
    }

    return <>
        <input type="file" multiple
            ref={fileInputRef}
            onChange={(e) => {
                const files = e.target.files
                if (files) {
                    onAddFile(files)
                }
            }} className='hidden' />
        <Button variant="secondary" size="icon" onClick={onClick}>
            <PlusIcon />
        </Button>
    </>
}