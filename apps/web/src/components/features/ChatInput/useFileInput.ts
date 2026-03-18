import { atomFamily, atomWithStorage } from 'jotai/utils'
import { atom, useSetAtom } from 'jotai'
import { FrappeConfig, FrappeContext, useFrappeDeleteDoc } from 'frappe-react-sdk'
import { useContext } from 'react'
import { toast } from 'sonner'

/**
 * 
 * For file uploads, we need to consider a few scenarios:
 * 
 * 1. User selects multiple files, but then hits the send button. Some files were uploaded, some were still inflight. 
 * In such a case, we queue the message and when all files upload, we process the queue.
 * 
 * 2. User selects a file and it's being uploaded but the user then closes the tab - in this case we lose the file (acceptable)
 * 3. User selects a file and it's being uploaded - the user can switch channels when the file is being uploaded and resume once back
 * 4. User selects a file and it's uploaded - then the user refreshes the tab - the user should still see the file in the chat input.
 * 
 * To cater to the above:
 * 
 * 1. Maintain a local state for all files that are being uploaded (uploadingFilesAtom) (3)
 * 2. Maintain a local state for all files that are uploaded (uploadedFilesAtom) - which is persisted in local storage (4)
 * 3. When a file finishes uploading, update uploadedFilesAtom, and check if the file with it's ID is in any queued message (another atom) (1)
 * 4. If the file is in a queued message, process the queued message (1)
 * 
 */

export interface QueuedFileType {
    /** The file object picked by the user */
    file: File,
    /** Upload progress */
    uploadProgress?: number,
    status: 'uploading' | 'error',
    /** Frontend generated ID */
    id: string,
    /** Name of the file */
    fileName: string,
    /** Size of the file in bytes */
    size: number,
    /** When the file was uploaded in milliseconds */
    timestamp: number
}

export interface UploadedFile {
    /** File ID returned from the server */
    fileID: string
    /** File URL returned from the server */
    fileURL: string,
    /** Frontend generated ID */
    id: string,
    /** Name of the file */
    fileName: string,
    /** Size of the file in bytes */
    size: number,
    /** When the file was uploaded in milliseconds */
    timestamp: number
}



/** Atom to track files that are being uploaded per channel */
export const uploadingFilesAtom = atomFamily((_channelID: string) => atom<QueuedFileType[]>([]))

/** Atom to track files that are uploaded per channel */
export const uploadedFilesAtom = atomFamily((channelID: string) => atomWithStorage<UploadedFile[]>(`uploaded-files-${channelID}`, []))


export const useAttachFile = (channelID: string) => {

    const { file } = useContext(FrappeContext) as FrappeConfig


    const setUploadingFiles = useSetAtom(uploadingFilesAtom(channelID))
    const setUploadedFiles = useSetAtom(uploadedFilesAtom(channelID))

    /** 
     * When a file is attached by the user, start uploading it immediately
     * The user should not wait for files to upload when they hit the send button.
     */
    const onAddFile = (files: FileList) => {
        const filesToBeUploaded = Array.from(files).map((file) => ({
            file: file,
            uploadProgress: 0,
            status: 'uploading' as const,
            id: crypto.randomUUID(),
            fileName: file.name,
            size: file.size,
            timestamp: Date.now()
        }))
        setUploadingFiles((prevFiles) => [...prevFiles, ...filesToBeUploaded])

        for (const f of filesToBeUploaded) {
            file.uploadFile(f.file, {
                doctype: 'Raven Message',
                isPrivate: true
            }, (_uploadedBytes, _totalBytes, progress) => {
                const progressPercentage = Math.round((progress?.progress ?? 0) * 100)
                setUploadingFiles((prevFiles) => prevFiles.map((file) => file.id === f.id ? { ...file, uploadProgress: progressPercentage, status: 'uploading' as const } : file))
            }).then(res => {
                // When upload is finished, add the file to the uploaded files atom and remove from the uploading files atom
                setUploadedFiles((prevFiles) => [...prevFiles, {
                    fileID: res.data.message.name,
                    fileURL: res.data.message.file_url,
                    id: f.id,
                    fileName: f.fileName,
                    size: f.size,
                    timestamp: f.timestamp
                }])
                setUploadingFiles((prevFiles) => prevFiles.filter((file) => file.id !== f.id))

                // TODO: Check if this file is a part of any queued message. If yes, we need to process the message
            }).catch(() => {
                toast.error("There was an error while uploading the file " + f.file.name)
                setUploadingFiles((prevFiles) => prevFiles.map((file) => file.id === f.id ? { ...file, status: 'error' as const } : file))
            })
        }
    }

    return onAddFile
}

export interface FileItemType {
    id: string,
    fileName: string,
    size: number,
    timestamp: number,
    uploadProgress?: number,
    status: 'uploading' | 'uploaded' | 'error',
    fileID?: string,
    fileURL?: string,
}

export const useRemoveFile = (channelID: string) => {

    const { deleteDoc } = useFrappeDeleteDoc()
    const setUploadedFiles = useSetAtom(uploadedFilesAtom(channelID))
    const setUploadingFiles = useSetAtom(uploadingFilesAtom(channelID))

    /** 
     * TODO: Add support for AbortController to cancel requests mid-flight
     * When the user decides to delete a file they attached, check if the file is being uploaded.
     * If it is already uploaded, delete the file from the server.
     * If it is being uploaded, wait for the file to upload and then delete the file from the server.
     * 
     */
    const onRemoveFile = (file: FileItemType) => {
        if (file.fileID) {
            setUploadedFiles((prevFiles) => prevFiles.filter((f) => f.fileID !== file.fileID))
            deleteDoc('File', file.fileID)
        } else {
            // Remove from both queues using frontend ID
            setUploadingFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id))
            setUploadedFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id))
        }

    }

    return onRemoveFile
}