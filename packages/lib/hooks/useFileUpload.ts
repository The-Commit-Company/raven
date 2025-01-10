import { useContext, useState } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { CustomFile } from '@raven/types/common/File'

export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}

export interface Caption {
  caption: string,
  fileName: string,
}

export default function useFileUpload(channelID: string) {

  const { file } = useContext(FrappeContext) as FrappeConfig

  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})

  const uploadFiles = async (files: File[], captions?: Caption[]) => {
    if (files.length > 0) {
      const promises = files.map(async (f: File) => {
        const newFile = f as CustomFile
        newFile.fileID = newFile.name + Date.now()
        return file.uploadFile(newFile,
          {
            isPrivate: true,
            doctype: 'Raven Message',
            otherData: {
              channelID: channelID,
              caption: captions?.find(c => c.fileName === newFile.name)?.caption ?? '',
            },
            fieldname: 'file',
          },
          (bytesUploaded, totalBytes) => {
            const percentage = Math.round((bytesUploaded / (totalBytes ?? newFile.size)) * 100)
            setFileUploadProgress(p => ({
              ...p,
              [newFile.fileID]: {
                progress: percentage,
                isComplete: false,
              },
            }))
          },
          'raven.api.upload_file.upload_file_with_message')
          .then(() => {
            setFileUploadProgress(p => ({
              ...p,
              [newFile.fileID]: {
                progress: 100,
                isComplete: true,
              },
            }))
          })
          .catch(() => {
            setFileUploadProgress(p => {
              const newProgress = { ...p }
              delete newProgress[newFile.fileID]
              return newProgress
            })
          })
      })

      return Promise.all(promises)
        .catch((e) => {
          console.error(e)
        })
    } else {
      return Promise.resolve()
    }
  }

  return {
    uploadFiles,
    fileUploadProgress
  }
}