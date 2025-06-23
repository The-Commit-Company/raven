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
import { useContext, useState, useEffect, useRef } from 'react'
import { Message } from '../../../../../../types/Messaging/Message'
import { useOnlineStatus } from '../../network/useNetworkStatus'

// export const useSendMessage = (
//   channelID: string,
//   uploadFiles: (selectedMessage?: Message | null) => Promise<RavenMessage[]>,
//   onMessageSent: (messages: RavenMessage[]) => void,
//   selectedMessage?: Message | null
// ) => {
//   const { call, loading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')
//   const { updateLastMessageForChannel } = useUpdateLastMessageDetails()
//   const { currentUser } = useContext(UserContext)

//   const updateSidebarMessage = (msg: RavenMessage, fallbackText?: string) => {
//     updateLastMessageForChannel(channelID, {
//       message_id: msg.name,
//       content: fallbackText || msg.content || '',
//       owner: currentUser,
//       message_type: msg.message_type,
//       is_bot_message: msg.is_bot_message,
//       bot: msg.bot || null,
//       timestamp: new Date().toISOString()
//     })
//   }

//   const sendMessage = async (content: string, json?: any, sendSilently: boolean = false): Promise<void> => {
//     if (content.trim()) {
//       return call({
//         channel_id: channelID,
//         text: content,
//         json_content: json,
//         is_reply: selectedMessage ? 1 : 0,
//         linked_message: selectedMessage ? selectedMessage.name : null,
//         send_silently: sendSilently
//       })
//         .then((res) => {
//           updateSidebarMessage(res.message)
//           onMessageSent([res.message])
//         })
//         .then(() => uploadFiles())
//         .then((res: RavenMessage[]) => {
//           if (res?.length > 0) {
//             const last = res[res?.length - 1]
//             const text = last.message_type === 'Image' ? 'Đã gửi ảnh' : 'Đã gửi file'
//             updateSidebarMessage(last, text)
//           }
//           onMessageSent(res)
//         })
//     } else {
//       return uploadFiles(selectedMessage).then((res: RavenMessage[]) => {
//         if (res?.length > 0) {
//           const last = res[res?.length - 1]
//           const text = last.message_type === 'Image' ? 'Đã gửi ảnh' : 'Đã gửi file'
//           updateSidebarMessage(last, text)
//         }
//         onMessageSent(res)
//       })
//     }
//   }

//   return {
//     sendMessage,
//     loading
//   }
// }

export type PendingMessage = {
  id: string
  content: string
  status: 'pending' | 'sent' | 'error'
  createdAt: number
}

export const useSendMessage = (
  channelID: string,
  uploadFiles: (selectedMessage?: Message | null) => Promise<RavenMessage[]>,
  onMessageSent: (messages: RavenMessage[]) => void,
  selectedMessage?: Message | null
) => {
  const { call, loading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')
  const { updateLastMessageForChannel } = useUpdateLastMessageDetails()
  const { currentUser } = useContext(UserContext)
  const isOnline = useOnlineStatus()

  const STORAGE_KEY = `pending_messages_${channelID}`

  const [pendingMessages, setPendingMessages] = useState<Record<string, PendingMessage[]>>({})
  const pendingQueueRef = useRef<Record<string, PendingMessage[]>>({})

  const persistPendingMessages = (updated: Record<string, PendingMessage[]>) => {
    const current = updated[channelID] || []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  }

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

  const sendOneMessage = async (content: string, client_id: string, json?: any, sendSilently = false) => {
    const res = await call({
      channel_id: channelID,
      text: content,
      client_id,
      json_content: json,
      is_reply: selectedMessage ? 1 : 0,
      linked_message: selectedMessage ? selectedMessage.name : null,
      send_silently: sendSilently
    })

    const msgWithClientId = { ...res.message, client_id }

    updateSidebarMessage(msgWithClientId)
    onMessageSent([msgWithClientId])

    setPendingMessages((prev) => {
      const updatedChannel = (prev[channelID] || []).filter((m) => m.id !== client_id)
      const updated = {
        ...prev,
        [channelID]: updatedChannel
      }
      pendingQueueRef.current = {
        ...pendingQueueRef.current,
        [channelID]: updatedChannel.filter((m) => m.status === 'pending')
      }
      persistPendingMessages(updated)
      return updated
    })
  }

  const sendTextMessage = async (content: string, json?: any, sendSilently = false) => {
    const client_id = `${Date.now()}-${Math.random()}`
    await sendOneMessage(content, client_id, json, sendSilently)
  }

  const sendFileMessages = async () => {
    const fileMessages = await uploadFiles(selectedMessage)
    if (fileMessages?.length > 0) {
      const last = fileMessages[fileMessages.length - 1]
      const text = last.message_type === 'Image' ? 'Đã gửi ảnh' : 'Đã gửi file'
      updateSidebarMessage(last, text)
      onMessageSent(fileMessages)
    }
  }

  const sendMessage = async (content: string, json?: any, sendSilently = false) => {
    try {
      if (content.trim()) {
        await sendTextMessage(content, json, sendSilently)
      }
      await sendFileMessages()
    } catch (err) {
      console.error('sendMessage error', err)

      if (content.trim()) {
        const client_id = `${Date.now()}-${Math.random()}`
        const newPending: PendingMessage = {
          id: client_id,
          content,
          status: 'pending',
          createdAt: Date.now()
        }

        setPendingMessages((prev) => {
          const updated = {
            ...prev,
            [channelID]: [...(prev[channelID] || []), newPending]
          }
          pendingQueueRef.current = {
            ...pendingQueueRef.current,
            [channelID]: updated[channelID].filter((m) => m.status === 'pending')
          }
          persistPendingMessages(updated)
          return updated
        })
      }
    }
  }

  // Load pendingMessages từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PendingMessage[]
        setPendingMessages((prev) => ({
          ...prev,
          [channelID]: parsed
        }))
        pendingQueueRef.current[channelID] = parsed.filter((m) => m.status === 'pending')
      } catch (err) {
        console.error('Error parsing saved pending messages:', err)
      }
    }
  }, [channelID])

  // Không tự retry khi có mạng nữa — để user tự bấm retry
  const retryPendingMessages = async () => {
    const queue = [...(pendingQueueRef.current[channelID] || [])]

    for (const msg of queue) {
      try {
        await sendOneMessage(msg.content, msg.id)
      } catch (err) {
        console.error('retry sendMessage error', err)
      }
    }
  }

  // Tự động đánh dấu error nếu pending quá 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      setPendingMessages((prev) => {
        const channelPending = prev[channelID] || []
        const updatedChannelPending = channelPending.map((m) => {
          if (m.status === 'pending' && now - m.createdAt > 30000) {
            return { ...m, status: 'error' }
          }
          return m
        })

        const updated = {
          ...prev,
          [channelID]: updatedChannelPending
        }

        pendingQueueRef.current = {
          ...pendingQueueRef.current,
          [channelID]: updatedChannelPending.filter((m) => m.status === 'pending')
        }
        persistPendingMessages(updated)

        return updated
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [channelID])

  return {
    sendMessage,
    loading,
    pendingMessages: pendingMessages[channelID] || [],
    retryPendingMessages // => dùng cho nút "Gửi lại"
  }
}
