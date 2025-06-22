// import { useFrappePostCall } from 'frappe-react-sdk'
// import { Message } from '../../../../../../types/Messaging/Message'
// import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'

// export const useSendMessage = (
//   channelID: string,
//   uploadFiles: (selectedMessage?: Message | null) => Promise<RavenMessage[]>,
//   onMessageSent: (messages: RavenMessage[]) => void,
//   selectedMessage?: Message | null
// ) => {
//   const { call, loading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')

//   const sendMessage = async (content: string, json?: any, sendSilently: boolean = false): Promise<void> => {
//     if (content) {
//       return call({
//         channel_id: channelID,
//         text: content,
//         json_content: json,
//         is_reply: selectedMessage ? 1 : 0,
//         linked_message: selectedMessage ? selectedMessage.name : null,
//         send_silently: sendSilently ? true : false
//       })
//         .then((res) => onMessageSent([res.message]))
//         .then(() => uploadFiles())
//         .then((res) => {
//           onMessageSent(res)
//         })
//     } else {
//       return uploadFiles(selectedMessage).then((res) => {
//         onMessageSent(res)
//       })
//     }
//   }

//   return {
//     sendMessage,
//     loading
//   }
// }
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { UserContext } from '@/utils/auth/UserProvider'
import { useUpdateLastMessageDetails } from '@/utils/channel/ChannelListProvider'
import { useFrappePostCall } from 'frappe-react-sdk'
import { useContext } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'

export const useSendMessage = (
  channelID: string,
  uploadFiles: (selectedMessage?: Message | null) => Promise<RavenMessage[]>,
  onMessageSent: (messages: RavenMessage[]) => void,
  selectedMessage?: Message | null
) => {
  const { call, loading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')
  const { updateLastMessageForChannel } = useUpdateLastMessageDetails()
  const { currentUser } = useContext(UserContext)

  const updateSidebarMessage = (msg: RavenMessage, fallbackText?: string) => {
    updateLastMessageForChannel(channelID, {
      message_id: msg.name,
      content: fallbackText || msg.content || '',
      owner: currentUser,
      message_type: msg.message_type,
      is_bot_message: msg.is_bot_message,
      bot: msg.bot || null,
      timestamp: new Date().toISOString()
    })
  }

  const sendMessage = async (content: string, json?: any, sendSilently: boolean = false): Promise<void> => {
    if (content.trim()) {
      return call({
        channel_id: channelID,
        text: content,
        json_content: json,
        is_reply: selectedMessage ? 1 : 0,
        linked_message: selectedMessage ? selectedMessage.name : null,
        send_silently: sendSilently
      })
        .then((res) => {
          updateSidebarMessage(res.message)
          onMessageSent([res.message])
        })
        .then(() => uploadFiles())
        .then((res: RavenMessage[]) => {
          if (res?.length > 0) {
            const last = res[res?.length - 1]
            const text = last.message_type === 'Image' ? 'Đã gửi ảnh' : 'Đã gửi file'
            updateSidebarMessage(last, text)
          }
          onMessageSent(res)
        })
    } else {
      return uploadFiles(selectedMessage).then((res: RavenMessage[]) => {
        if (res?.length > 0) {
          const last = res[res?.length - 1]
          const text = last.message_type === 'Image' ? 'Đã gửi ảnh' : 'Đã gửi file'
          updateSidebarMessage(last, text)
        }
        onMessageSent(res)
      })
    }
  }

  return {
    sendMessage,
    loading
  }
}
