import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { useContext, useRef, useState } from 'react'
import { Message } from '../../../../../../../types/Messaging/Message'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'


export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']
export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}
export default function useFileUpload(channelID: string, selectedMessage?: Message | null) {

  const { file } = useContext(FrappeContext) as FrappeConfig
  const fileInputRef = useRef<any>(null)

  const [files, setFiles] = useState<CustomFile[]>([])

  const [compressImages, setCompressImages] = useState(true)

  const filesStateRef = useRef<CustomFile[]>([])

  filesStateRef.current = files

  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})

  const addFile = (file: File) => {

    const newFile: CustomFile = file as CustomFile
    if (newFile) {
      newFile.fileID = file.name + Date.now()
      newFile.uploadProgress = 0
      setFiles((f: any) => [...f, newFile])
    }
  }
  const removeFile = (id: string) => {
    let newFiles = files.filter(file => file.fileID !== id)
    setFiles(newFiles)
    setFileUploadProgress(p => {
      const newProgress = { ...p }
      delete newProgress[id]
      return newProgress
    })
  }

  const uploadFiles = async () => {
    const newFiles = [...filesStateRef.current]
    if (newFiles.length > 0) {
      const promises = newFiles.map(async (f: CustomFile) => {
        return file.uploadFile(f,
          {
            isPrivate: true,
            doctype: 'Raven Message',
            otherData: {
              channelID: channelID,
              compressImages: compressImages,
            },
            fieldname: 'file',
          },
          (bytesUploaded, totalBytes) => {
            const percentage = Math.round((bytesUploaded / (totalBytes ?? f.size)) * 100)

            setFileUploadProgress(p => ({
              ...p,
              [f.fileID]: {
                progress: percentage,
                isComplete: false,
              },
            }))
          },
          'raven.api.upload_file.upload_file_with_message')
          .then(() => {
            setFiles(files => files.filter(file => file.fileID !== f.fileID))
            setFileUploadProgress(p => ({
              ...p,
              [f.fileID]: {
                progress: 100,
                isComplete: true,
              },
            }))
          })
          .catch(() => {
            setFileUploadProgress(p => {
              const newProgress = { ...p }
              delete newProgress[f.fileID]
              return newProgress
            })
          })
      })

      return Promise.all(promises)
        .then(() => {
          setFiles([])
        }).catch((e) => {
          console.error(e)
        })
    } else {
      return Promise.resolve()
    }
  }

  return {
    fileInputRef,
    files,
    setFiles,
    removeFile,
    addFile,
    compressImages,
    setCompressImages,
    uploadFiles,
    fileUploadProgress
  }
}