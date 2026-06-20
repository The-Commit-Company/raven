import { useAtomValue } from 'jotai'
import { uploadingFilesAtom, uploadedFilesAtom, useAttachFile, useRemoveFile, FileItemType } from './useFileInput'
import { Button } from '@components/ui/button'
import { AlertCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import FileTypeIcon from '@components/common/FileIcons/FileTypeIcon'
import { formatBytes, getFileExtension } from '@raven/lib/utils/operations'
import { ProgressCircle } from '@components/ui/circular-progress'
import _ from '@lib/translate'

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

    const onRemove = useRemoveFile(channelID)

    return (
        <div className='flex gap-2 flex-wrap'>
            {files.map((file) => (
                <FileItem key={file.id} file={file} onRemove={onRemove} />
            ))}
        </div>
    )
}

const FileItem = ({ file, onRemove }: { file: FileItemType, onRemove: (file: FileItemType) => void }) => {

    const extension = getFileExtension(file.fileName)

    const onRemoveClick = () => {
        onRemove(file)
    }

    return <div className="rounded-lg border border-outline-gray-2 min-w-64">
        <div className="flex items-center gap-2 p-2">
            <div className="shrink-0">
                <FileTypeIcon fileType={extension} size="sm" />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-ink-gray-8 truncate">
                    {file.fileName}
                </h4>
                <p className="text-xs text-ink-gray-5">
                    {formatBytes(file.size)}
                </p>
            </div>
            {/* When the file is being uploaded, show a circular progress bar and when it's uploaded show the delete button */}
            <div className="flex items-center size-9 justify-center">
                {file.status === 'uploading' &&
                    <div className='flex items-center justify-center size-9'>
                        <ProgressCircle value={file.uploadProgress ?? 0} className='text-ink-green-6' />
                    </div>}
                {file.status === 'uploaded' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        onClick={onRemoveClick}
                        title={_("Remove file")}
                    >
                        <Trash2Icon />
                    </Button>
                )}
                {file.status === 'error' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconButton
                        theme="red"
                        onClick={onRemoveClick}
                        title={_("Error uploading file. Remove and try again.")}
                    >
                        <AlertCircleIcon />
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
        <Button variant="subtle" size="sm" isIconButton onClick={onClick} type='button'>
            <PlusIcon />
        </Button>
    </>
}