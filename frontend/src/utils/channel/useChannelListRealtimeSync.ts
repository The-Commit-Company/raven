// channel_realtime_sync.ts
import { useEffect } from 'react'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useUpdateLastMessageDetails } from './ChannelListProvider'
interface UpdatedMessage {
  channel_id: string
  message_id: string
  content?: string
  json_content?: any
  message_type: string
  owner: string
  is_bot_message: number
  bot?: string | null
}

interface CreatedMessage extends UpdatedMessage {
  creation: string
}

/**
 * Hook tổng hợp để đồng bộ các sự kiện realtime liên quan đến message:
 * - message_created: khi có tin nhắn mới
 * - message_updated: khi tin nhắn bị chỉnh sửa
 * - message_deleted: (nếu cần mở rộng sau này)
 */
export const useChannelRealtimeSync = () => {
  const { updateLastMessageForChannel } = useUpdateLastMessageDetails()

  useFrappeEventListener('message_updated', (data) => {
    const msg = data?.message_details || data

    console.log(data);
    

    // Chuẩn hoá lại dữ liệu truyền vào
    const normalizedMessage = {
      message_id: data.message_id,
      content: msg.content || '',
      json_content: msg.json_content || null,
      message_type: msg.message_type || 'Text',
      owner: msg.owner || data.sender || '',
      is_bot_message: msg.is_bot_message || 0,
      bot: msg.bot || null
    }

    updateLastMessageForChannel(data.channel_id, normalizedMessage)
  })

  useFrappeEventListener<CreatedMessage>('message_created', (newMessage) => {
    if (!newMessage?.channel_id || !newMessage?.message_id) return

    const message = {
      ...newMessage,
      content: newMessage.content || '',
      json_content: newMessage.json_content || null,
      message_id: newMessage.message_id
    }

    updateLastMessageForChannel(newMessage.channel_id, message)
  })

  // Có thể thêm message_deleted ở đây nếu backend hỗ trợ
  // useFrappeEventListener<DeletedMessage>('message_deleted', (deletedMessage) => { ... })
}
