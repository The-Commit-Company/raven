import { SetStateAction, useContext, useState } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { CustomFile } from '@raven/types/common/File'
import { filesAtomFamily } from '@lib/ChatInputUtils'
import { useAtom } from 'jotai'
export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}

export default function useFileUpload(siteID: string, channelID: string) {

  const { file } = useContext(FrappeContext) as FrappeConfig
  const [files, setFiles] = useAtom(filesAtomFamily(siteID + channelID))

  const uploadFiles = async () => {

    for (const f of files) {
      try {

        await file.uploadFile(f,
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
            setFiles((prevFiles) => {
              return prevFiles.map((file) => {
                if (file.fileID === f.fileID) {
                  return { ...file, uploadProgress: percentage, uploading: true }
                }
                return file
              })
            })
          },
          'raven.api.upload_file.upload_file_with_message'
        ).then(() => {
          setFiles((prevFiles) => {
            return prevFiles.map((file) => {
              if (file.fileID === f.fileID) {
                return { ...file, uploadProgress: 100, uploading: false }
              }
              return file
            })
          })
        })
        setFiles((prevFiles) => {
          return prevFiles.filter((file) => file.fileID !== f.fileID)
        })
      } catch (error) {
        console.error(`Error uploading file ${f.name}`, error)
        setFiles((prevFiles) => {
          return prevFiles.filter((file) => file.fileID !== f.fileID)
        })
      }
    }
  }

  return {
    uploadFiles
  }
}