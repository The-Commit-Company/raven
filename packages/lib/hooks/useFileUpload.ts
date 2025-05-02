import { useContext } from 'react'
import { FrappeConfig, FrappeContext, useSWRConfig } from 'frappe-react-sdk'
import { filesAtomFamily } from '@lib/ChatInputUtils'
import { useAtom } from 'jotai'
import { RavenMessage } from '@raven/types/RavenMessaging/RavenMessage'
import { GetMessagesResponse } from '@raven/types/common/ChatStream'
import { CustomFile } from '@raven/types/common/File'
export interface FileUploadProgress {
  progress: number,
  isComplete: boolean,
}

export default function useFileUpload(siteID: string, channelID: string) {

  const { mutate } = useSWRConfig()

  const { file } = useContext(FrappeContext) as FrappeConfig
  const [files, setFiles] = useAtom(filesAtomFamily(siteID + channelID))

  const onMessageSendCompleted = (messages: RavenMessage[]) => {
    // Update the messages in the cache

    mutate({ path: `get_messages_for_channel_${channelID}` }, (data?: GetMessagesResponse) => {
      if (data && data?.message.has_new_messages) {
        return data
      }

      const existingMessages = data?.message.messages ?? []

      const newMessages = [...existingMessages]

      messages.forEach(message => {
        // Check if the message is already present in the messages array
        const messageIndex = existingMessages.findIndex(m => m.name === message.name)

        if (messageIndex !== -1) {
          // If the message is already present, update the message
          // @ts-ignore
          newMessages[messageIndex] = {
            ...message,
            _liked_by: "",
            is_pinned: 0,
            is_continuation: 0
          }
        } else {
          // If the message is not present, add the message to the array
          // @ts-ignore
          newMessages.push({
            ...message,
            _liked_by: "",
            is_pinned: 0,
            is_continuation: 0
          })
        }
      })

      return {
        message: {
          messages: newMessages.sort((a, b) => {
            return new Date(b.creation).getTime() - new Date(a.creation).getTime()
          }),
          has_new_messages: false,
          has_old_messages: data?.message.has_old_messages ?? false
        }
      }

    }, { revalidate: false })

  }

  const uploadFiles = async () => {

    for (const f of files) {
      try {

        setFiles((prevFiles: CustomFile[]) => {
          return prevFiles.map((file: CustomFile) => {
            if (file.fileID === f.fileID) {
              return { ...file, uploadProgress: 0, uploading: true }
            }
            return file
          })
        })
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
            setFiles((prevFiles: CustomFile[]) => {
              return prevFiles.map((file) => {
                if (file.fileID === f.fileID) {
                  return { ...file, uploadProgress: percentage, uploading: true }
                }
                return file
              })
            })
          },
          'raven.api.upload_file.upload_file_with_message'
        ).then((res) => {
          onMessageSendCompleted([res.data.message])
          setFiles((prevFiles: CustomFile[]) => {
            return prevFiles.map((file: CustomFile) => {
              if (file.fileID === f.fileID) {
                return { ...file, uploadProgress: 100, uploading: false }
              }
              return file
            })
          })
        })
        setFiles((prevFiles: CustomFile[]) => {
          return prevFiles.filter((file: CustomFile) => file.fileID !== f.fileID)
        })
      } catch (error) {
        console.error(`Error uploading file ${f.name}`, error)
        setFiles((prevFiles: CustomFile[]) => {
          return prevFiles.filter((file: CustomFile) => file.fileID !== f.fileID)
        })
      }
    }
  }

  return {
    uploadFiles
  }
}