import { useGetUser } from "@/hooks/useGetUser"

const MAX_PREVIEW_LENGTH = 20

const truncateText = (text: string, maxLength: number = MAX_PREVIEW_LENGTH): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text

interface Channel {
  is_direct_message: boolean
  last_message_details: any
}


export function formatLastMessage(
  channel: Channel,
  currentUser: string,
  senderName?: string // optional
): string {
  let lastMessageText = ''
  let senderPrefix = ''

  try {
    const raw =
      typeof channel.last_message_details === 'string'
        ? JSON.parse(channel.last_message_details)
        : channel.last_message_details

    const isCurrentUser = raw?.owner === currentUser
    const isGroup = !channel.is_direct_message

    if (isGroup) {
      senderPrefix = isCurrentUser ? 'Bạn' : senderName || raw?.owner || ''
    } else {
      senderPrefix = isCurrentUser ? 'Bạn' : ''
    }

    if (raw?.message_type === 'Image') {
      lastMessageText = 'Đã gửi ảnh'
    } else if (raw?.message_type === 'File' && (raw.file || raw.attachment?.file_url)) {
      const fileName = raw.content || 'tệp tin'
      lastMessageText = `Đã gửi file ${truncateText(fileName)}`
    } else if (raw?.json_content) {
      const json = typeof raw.json_content === 'string' ? JSON.parse(raw.json_content) : raw.json_content
      const paragraph = json?.content?.[0]?.content?.[0]
      lastMessageText = truncateText(paragraph?.text || '')
    } else if (raw?.content && typeof raw.content === 'string') {
      const plainText = raw.content.replace(/<[^>]+>/g, '')
      lastMessageText = truncateText(plainText)
    }
  } catch (err) {
    return ''
  }

  return senderPrefix ? `${senderPrefix}: ${lastMessageText}` : lastMessageText
}

