import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Message } from '../../../../../../../types/Messaging/Message'
import { useOnlineStatus } from '@/components/feature/network/useNetworkStatus'

export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']
export interface FileUploadProgress {
  progress: number
  isComplete: boolean
}
// export default function useFileUpload(channelID: string) {
//   const { file } = useContext(FrappeContext) as FrappeConfig
//   const fileInputRef = useRef<any>(null)

//   const [files, setFiles] = useState<CustomFile[]>([])

//   const [compressImages, setCompressImages] = useState(true)

//   const filesStateRef = useRef<CustomFile[]>([])

//   filesStateRef.current = files

//   const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})

//   const addFile = (file: File) => {
//     const newFile: CustomFile = file as CustomFile
//     if (newFile) {
//       newFile.fileID = file.name + Date.now()
//       newFile.uploadProgress = 0
//       setFiles((f: any) => [...f, newFile])
//     }
//   }
//   const removeFile = (id: string) => {
//     const newFiles = files.filter((file) => file.fileID !== id)
//     setFiles(newFiles)
//     setFileUploadProgress((p) => {
//       const newProgress = { ...p }
//       delete newProgress[id]
//       return newProgress
//     })
//   }

//   const uploadFiles = async (selectedMessage?: Message | null): Promise<RavenMessage[]> => {
//     const newFiles = [...filesStateRef.current]
//     if (newFiles?.length > 0) {
//       const promises: Promise<RavenMessage | null>[] = newFiles?.map(async (f: CustomFile, index: number) => {
//         return file
//           .uploadFile(
//             f,
//             {
//               isPrivate: true,
//               doctype: 'Raven Message',
//               otherData: {
//                 channelID: channelID,
//                 compressImages: compressImages,
//                 is_reply: index === 0 ? (selectedMessage ? 1 : 0) : 0,
//                 linked_message: index === 0 ? (selectedMessage ? selectedMessage.name : null) : null
//               },
//               fieldname: 'file'
//             },
//             (bytesUploaded, totalBytes) => {
//               const percentage = Math.round((bytesUploaded / (totalBytes ?? f.size)) * 100)

//               setFileUploadProgress((p) => ({
//                 ...p,
//                 [f.fileID]: {
//                   progress: percentage,
//                   isComplete: false
//                 }
//               }))
//             },
//             'raven.api.upload_file.upload_file_with_message'
//           )
//           .then((res: { data: { message: RavenMessage } }) => {
//             setFiles((files) => files.filter((file) => file.fileID !== f.fileID))
//             setFileUploadProgress((p) => ({
//               ...p,
//               [f.fileID]: {
//                 progress: 100,
//                 isComplete: true
//               }
//             }))
//             return res.data.message
//           })
//           .catch((e) => {
//             setFileUploadProgress((p) => {
//               const newProgress = { ...p }
//               delete newProgress[f.fileID]
//               return newProgress
//             })

//             toast.error('There was an error uploading the file ' + f.name, {
//               description: getErrorMessage(e)
//             })

//             return null
//           })
//       })

//       return Promise.all(promises)
//         .then((res) => {
//           setFiles([])
//           return res.filter((file) => file !== null)
//         })
//         .catch((e) => {
//           console.error(e)
//           return []
//         })
//     } else {
//       return Promise.resolve([])
//     }
//   }

//   return {
//     fileInputRef,
//     files,
//     setFiles,
//     removeFile,
//     addFile,
//     compressImages,
//     setCompressImages,
//     uploadFiles,
//     fileUploadProgress
//   }
// }

export default function useFileUploadV2(channelID: string) {
  const { file } = useContext(FrappeContext) as FrappeConfig
  const isOnline = useOnlineStatus()

  const fileInputRef = useRef<any>(null)
  const filesStateRef = useRef<CustomFile[]>([])

  const [files, setFiles] = useState<CustomFile[]>([])
  const [compressImages, setCompressImages] = useState(true)
  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})
  const [pendingFiles, setPendingFiles] = useState<Record<string, CustomFile[]>>({})

  const pendingQueueRef = useRef<Record<string, CustomFile[]>>({})
  const isRetryingRef = useRef(false)

  filesStateRef.current = files

  const addFile = (file: File) => {
    const newFile: CustomFile = file as CustomFile
    newFile.fileID = file.name + Date.now()
    newFile.uploadProgress = 0
    setFiles((f) => [...f, newFile])
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

  const uploadOneFile = async (f: CustomFile, selectedMessage?: Message | null): Promise<RavenMessage | null> => {
    return file
      .uploadFile(
        f,
        {
          isPrivate: true,
          doctype: 'Raven Message',
          otherData: {
            channelID: channelID,
            compressImages: compressImages,
            is_reply: selectedMessage ? 1 : 0,
            linked_message: selectedMessage ? selectedMessage.name : null,
            text: '' // không để text là tên file
          },
          fieldname: 'file'
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
        'raven.api.upload_file.upload_file_with_message'
      )
      .then((res: { data: { message: RavenMessage } }) => {
        setFiles((prev) => prev.filter((file) => file.fileID !== f.fileID))
        setFileUploadProgress((p) => ({
          ...p,
          [f.fileID]: {
            progress: 100,
            isComplete: true
          }
        }))
        return res.data.message
      })
      .catch((e) => {
        console.error('uploadFile error', e)
        toast.error('Error uploading file ' + f.name, {
          description: getErrorMessage(e)
        })

        // thêm vào pending
        setPendingFiles((prev) => {
          const updated = {
            ...prev,
            [channelID]: [...(prev[channelID] || []), f]
          }
          pendingQueueRef.current = updated
          return updated
        })

        return null
      })
  }

  const uploadFiles = async (selectedMessage?: Message | null): Promise<RavenMessage[]> => {
    const newFiles = [...filesStateRef.current]
    if (newFiles?.length === 0) return []

    const promises = newFiles.map((f) => uploadOneFile(f, selectedMessage))

    return Promise.all(promises)
      .then((res) => {
        setFiles([])
        return res.filter((file) => file !== null)
      })
      .catch((e) => {
        console.error(e)
        return []
      })
  }

  // retry khi online trở lại
  useEffect(() => {
    if (isOnline && pendingQueueRef.current[channelID]?.length > 0 && !isRetryingRef.current) {
      isRetryingRef.current = true

      const retry = async () => {
        console.log('Retry pendingFiles:', pendingQueueRef.current[channelID])
        const queue = [...(pendingQueueRef.current[channelID] || [])]

        for (const file of queue) {
          try {
            await uploadOneFile(file)
          } catch (err) {
            console.error('retry uploadFile error', err)
          }
        }

        setPendingFiles((prev) => ({
          ...prev,
          [channelID]: []
        }))

        pendingQueueRef.current[channelID] = []
        isRetryingRef.current = false
      }

      retry()
    }
  }, [isOnline, channelID])

  return {
    fileInputRef,
    files,
    setFiles,
    removeFile,
    addFile,
    compressImages,
    setCompressImages,
    uploadFiles,
    fileUploadProgress,
    pendingFiles: pendingFiles[channelID] || []
  }
}
