import { SetStateAction, useContext, useState } from 'react'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { CustomFile } from '@raven/types/common/File'
import { filesAtom } from '@lib/filesAtom'
import { useAtom } from 'jotai'
import { RavenMessage } from '@raven/types/RavenMessaging/RavenMessage'

export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}

export default function useFileUpload(channelID: string) {

  const { file } = useContext(FrappeContext) as FrappeConfig
  const [files, setFiles] = useAtom(filesAtom)

  const uploadFiles = async (): Promise<RavenMessage[]> => {
    // Return early if no files to upload
    if (files.length === 0) {
      return Promise.resolve([]);
    }

    const promises = files.map(async (f) => {
      try {
        const result = await file.uploadFile(f,
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
        )

        // Update the file's progress to complete
        setFiles((prevFiles) => {
          return prevFiles.map((file) => {
            if (file.fileID === f.fileID) {
              return { ...file, uploadProgress: 100, uploading: false }
            }
            return file
          })
        })

        // Remove the file from the files state
        setFiles((prevFiles) => {
          return prevFiles.filter((file) => file.fileID !== f.fileID)
        })

        return result.data.message;
      } catch (error) {
        console.error(`Error uploading file ${f.name}`, error)

        // Remove the failed file
        setFiles((prevFiles) => {
          return prevFiles.filter((file) => file.fileID !== f.fileID)
        })

        return null;
      }
    });

    // Wait for all promises to resolve and filter out nulls (failed uploads)
    return Promise.all(promises)
      .then((results) => {
        return results.filter((result) => result !== null);
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
        return [];
      });
  }

  return {
    uploadFiles
  }
}