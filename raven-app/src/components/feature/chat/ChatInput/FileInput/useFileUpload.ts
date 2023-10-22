import { CustomFile } from '@/components/feature/file-upload/FileDrop'
import { useRef, useState } from 'react'
import { Message } from '../../../../../../../types/Messaging/Message'
import { useFrappeCreateDoc, useFrappeFileUpload, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { getFileExtension } from '@/utils/operations'


export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

export default function useFileUpload(channelID: string, selectedMessage?: Message | null) {

  const fileInputRef = useRef<any>(null)

  const [files, setFiles] = useState<CustomFile[]>([])

  const { createDoc, loading: creatingDoc, error: errorCreatingDoc, reset: resetCreateDoc } = useFrappeCreateDoc()
  const { upload, loading: uploadingFile, progress, error: errorUploadingDoc, reset: resetUploadDoc } = useFrappeFileUpload()
  const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc, reset: resetUpdateDoc } = useFrappeUpdateDoc()

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
  }

  const uploadFiles = async () => {

    if (files.length > 0) {
      const promises = files.map(async (f: CustomFile) => {
        let docname = ''
        return createDoc('Raven Message', {
          channel_id: channelID
        }).then((d) => {
          docname = d.name
          f.uploading = true
          f.uploadProgress = progress
          return upload(f, {
            isPrivate: true,
            doctype: 'Raven Message',
            docname: d.name,
            fieldname: 'file',
          })
        }).then((r) => {
          f.uploading = false
          return updateDoc("Raven Message", docname, {
            file: r.file_url,
            message_type: fileExt.includes(getFileExtension(f.name)) ? "Image" : "File",
          })
        })
      })

      return Promise.all(promises)
        .then(() => {
          setFiles([])
          resetCreateDoc()
          resetUploadDoc()
          resetUpdateDoc()
        }).catch((e) => {
          console.log(e)
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
    uploadFiles
  }
}