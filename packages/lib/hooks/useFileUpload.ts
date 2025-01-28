import { useContext, useState } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { CustomFile } from '@raven/types/common/File'

export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}

export default function useFileUpload(channelID: string) {

  const { file } = useContext(FrappeContext) as FrappeConfig

  const [fileUploadProgress, setFileUploadProgress] = useState<Record<string, FileUploadProgress>>({})

  const uploadFiles = async (files: CustomFile[]) => {

    if (files.length > 0) {
      const promises = files.map(async (f: CustomFile) => {

        return file.uploadFile(f,
          {
            isPrivate: true,
            doctype: 'Raven Message',
            otherData: {
              channelID: channelID,
              caption: f.caption ?? '',
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
            setFileUploadProgress(p => ({
              ...p,
              [f.fileID]: {
                progress: 100,
                isComplete: true,
              },
            }))
          })
          .catch((e) => {
            console.error(`Error uploading file ${f.name}`, e)
            setFileUploadProgress(p => {
              const newProgress = { ...p }
              delete newProgress[f.fileID]
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