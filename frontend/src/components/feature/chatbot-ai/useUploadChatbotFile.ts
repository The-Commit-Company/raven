import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useContext, useRef, useState } from 'react'
import { toast } from 'sonner'

export interface ChatbotFileUploadResult {
  message: string
  file_url: string
}

export interface FileUploadProgress {
  progress: number
  isComplete: boolean
}

export default function useUploadChatbotFile(conversation_id: string, messageText: string) {
  const { file } = useContext(FrappeContext) as FrappeConfig
  const fileInputRef = useRef<any>(null)

  const [files, setFiles] = useState<CustomFile[]>([])
  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})

  const filesStateRef = useRef<CustomFile[]>([])
  filesStateRef.current = files

  const addFile = (file: File) => {
    const newFile: CustomFile = file as CustomFile
    if (newFile) {
      newFile.fileID = file.name + Date.now()
      newFile.uploadProgress = 0
      setFiles((f) => [...f, newFile])
    }
  }

  const removeFile = (id: string) => {
    const newFiles = files.filter((file) => file.fileID !== id)
    setFiles(newFiles)
    setFileUploadProgress((p) => {
      const newProgress = { ...p }
      delete newProgress[id]
      return newProgress
    })
  }

  const uploadFiles = async (): Promise<ChatbotFileUploadResult[]> => {
    const currentFiles = [...filesStateRef.current]
    if (currentFiles?.length === 0) return []

    const promises = currentFiles?.map(async (f: CustomFile) => {
      return file
        .uploadFile(
          f,
          {
            isPrivate: true,
            doctype: 'ChatMessage',
            fieldname: 'file',
            otherData: {
              conversation_id,
              message: messageText
            }
          },
          (bytesUploaded, totalBytes) => {
            const percentage = Math.round((bytesUploaded / (totalBytes ?? f.size)) * 100)
            setFileUploadProgress((p) => ({
              ...p,
              [f.fileID]: {
                progress: percentage,
                isComplete: false
              }
            }))
          },
          'raven.api.upload_chatbot_file.upload_file_with_message'
        )
        .then((res: { data: ChatbotFileUploadResult }) => {
          setFiles((files) => files.filter((file) => file.fileID !== f.fileID))
          setFileUploadProgress((p) => ({
            ...p,
            [f.fileID]: {
              progress: 100,
              isComplete: true
            }
          }))
          return res.data
        })
        .catch((e) => {
          setFileUploadProgress((p) => {
            const newProgress = { ...p }
            delete newProgress[f.fileID]
            return newProgress
          })

          toast.error('Upload file thất bại: ' + f.name, {
            description: getErrorMessage(e)
          })

          return null
        })
    })

    const results = await Promise.all(promises)
    return results.filter((r): r is ChatbotFileUploadResult => r !== null)
  }

  return {
    fileInputRef,
    files,
    setFiles,
    removeFile,
    addFile,
    uploadFiles,
    fileUploadProgress
  }
}
