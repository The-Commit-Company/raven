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

export type PendingMessage = {
  id: string
  content?: string
  status: 'pending' | 'error'
  createdAt: number
  message_type: 'Text' | 'Image' | 'File' | 'Video'
  file?: RavenMessage['file']
  json_content?: any
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
  const STORAGE_KEY = `pending_messages_${channelID}`

  const [pendingMessages, setPendingMessages] = useState<Record<string, PendingMessage[]>>({})
  const pendingQueueRef = useRef<Record<string, PendingMessage[]>>({})

  const createClientId = () => `${Date.now()}-${Math.random()}`

  const persistPendingMessages = (updated: Record<string, PendingMessage[]>) => {
    const current = updated[channelID] || []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  }

  const updatePendingState = (updater: (messages: PendingMessage[]) => PendingMessage[]) => {
    setPendingMessages((prev) => {
      const updatedChannel = updater(prev[channelID] || [])
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

    updatePendingState((msgs) => msgs.filter((m) => m.id !== client_id))
  }

  const sendTextMessage = async (content: string, json?: any, sendSilently = false) => {
    const client_id = createClientId()
    await sendOneMessage(content, client_id, json, sendSilently)
  }

  const sendFileMessages = async () => {
    const fileMessages = await uploadFiles(selectedMessage)
    if (fileMessages?.length > 0) {
      const last = fileMessages[fileMessages.length - 1]
      const text = last.message_type === 'Image' ? 'Đã gửi ảnh' : 'Đã gửi file'

      try {
        updateSidebarMessage(last, text)
        onMessageSent(fileMessages)
      } catch (err) {
        console.error('sendFileMessages error', err)

        const pendingFileMessages: PendingMessage[] = fileMessages
          .filter((msg) => ['File', 'Text', 'Image', 'Video'].includes(msg.message_type))
          .map((msg) => ({
            id: createClientId(),
            content: msg.text || '',
            status: 'pending',
            createdAt: Date.now(),
            message_type: msg.message_type as 'File' | 'Text' | 'Image' | 'Video',
            file: msg.file,
            json_content: msg.json
          }))
        updatePendingState((msgs) => [...msgs, ...pendingFileMessages])
      }
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
        const client_id = createClientId()
        const newPending: PendingMessage = {
          id: client_id,
          content,
          status: 'pending',
          createdAt: Date.now(),
          message_type: 'Text'
        }
        updatePendingState((msgs) => [...msgs, newPending])
      }
    }
  }

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

  const retryPendingMessages = async () => {
    const queue = [...(pendingQueueRef.current[channelID] || [])]

    for (const msg of queue) {
      try {
        if (msg.message_type === 'Text') {
          await sendOneMessage(msg.content || '', msg.id)
        } else {
          console.warn('Retrying file message...')
          // Bạn có thể cải tiến đoạn này: nếu muốn gửi lại file thực sự
          // Hoặc chỉ gửi metadata hoặc thông báo đã lỗi
        }
      } catch (err) {
        console.error('retryPendingMessages error', err)
      }
    }
  }

  const sendOnePendingMessage = async (id: string) => {
    const msg = (pendingMessages[channelID] || []).find((m) => m.id === id)
    if (!msg) return
    try {
      if (msg.message_type === 'Text') {
        await sendOneMessage(msg.content || '', msg.id)
      } else {
        console.warn('Retrying one file message...')
      }
    } catch (err) {
      console.error('sendOnePendingMessage error', err)
    }
  }

  const removePendingMessage = (id: string) => {
    updatePendingState((msgs) => msgs.filter((m) => m.id !== id))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      updatePendingState((msgs) =>
        msgs.map((m) => {
          if (m.status === 'pending' && now - m.createdAt > 30000) {
            return { ...m, status: 'error' }
          }
          return m
        })
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [channelID])

  return {
    sendMessage,
    loading,
    pendingMessages: pendingMessages[channelID] || [],
    retryPendingMessages,
    sendOnePendingMessage,
    removePendingMessage
  }
}
