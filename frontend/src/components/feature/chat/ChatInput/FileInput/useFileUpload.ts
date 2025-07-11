import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { useContext, useRef, useState } from 'react'
import { Message } from '../../../../../../../types/Messaging/Message'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { atomFamily } from 'jotai/utils'
import { atom, useAtom } from 'jotai'


export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']
export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}

export const filesAtom = atomFamily((channelID: string) => atom<CustomFile[]>([]))

export default function useFileUpload(channelID: string) {

  const { file } = useContext(FrappeContext) as FrappeConfig
  const fileInputRef = useRef<any>(null)

  const [files, setFiles] = useAtom(filesAtom(channelID))

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

  const uploadFiles = async (selectedMessage?: Message | null, caption?: string): Promise<RavenMessage[]> => {
    const newFiles = [...filesStateRef.current]
    if (newFiles.length > 0) {
      const promises: Promise<RavenMessage | null>[] = newFiles.map(async (f: CustomFile, index: number) => {
        return file.uploadFile(f,
          {
            isPrivate: true,
            doctype: 'Raven Message',
            otherData: {
              channelID: channelID,
              compressImages: compressImages,
              is_reply: index === 0 ? selectedMessage ? 1 : 0 : 0,
              linked_message: index === 0 ? selectedMessage ? selectedMessage.name : null : null,
              caption: index === 0 && caption ? caption : ""
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
          .then((res: { data: { message: RavenMessage } }) => {
            setFiles(files => files.filter(file => file.fileID !== f.fileID))
            setFileUploadProgress(p => ({
              ...p,
              [f.fileID]: {
                progress: 100,
                isComplete: true,
              },
            }))
            return res.data.message
          })
          .catch((e) => {
            setFileUploadProgress(p => {
              const newProgress = { ...p }
              delete newProgress[f.fileID]
              return newProgress
            })

            toast.error("There was an error uploading the file " + f.name, {
              description: getErrorMessage(e)
            })

            return null
          })
      })

      return Promise.all(promises)
        .then((res) => {
          setFiles([])
          return res.filter((file) => file !== null)
        }).catch((e) => {
          console.error(e)
          return []
        })
    } else {
      return Promise.resolve([])
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