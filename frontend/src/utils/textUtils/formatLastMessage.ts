const MAX_PREVIEW_LENGTH = 20

export const truncateText = (text: string, maxLength: number = MAX_PREVIEW_LENGTH): string => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const isImageFile = (filename: string = ''): boolean => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename)

const isVideoFile = (filename: string = ''): boolean => /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(filename)

const isAudioFile = (filename: string = ''): boolean => /\.(mp3|wav|ogg|m4a|aac)$/i.test(filename)

const stripHtmlTags = (html: string): string => html.replace(/<\/?[^>]+(>|$)/g, '')

export interface Channel {
  is_direct_message: boolean
  last_message_details: any
}

export function formatLastMessage(
  channel: Channel,
  currentUser: string,
  senderName?: string,
  maxLength: number = MAX_PREVIEW_LENGTH
): string {
  if (!channel?.last_message_details) return ''

  let raw: any
  try {
    raw =
      typeof channel.last_message_details === 'string'
        ? JSON.parse(channel.last_message_details)
        : channel.last_message_details
  } catch {
    return ''
  }

  const isCurrentUser = raw.owner === currentUser
  const senderLabel = isCurrentUser ? 'Bạn' : channel.is_direct_message ? '' : senderName || raw.owner || 'Người dùng'

  let contentLabel = ''

  if (typeof raw.content === 'string') {
    const filename = raw.content

    switch (raw.message_type) {
      case 'Image':
        contentLabel = 'gửi ảnh'
        break
      case 'Audio':
        contentLabel = 'gửi âm thanh'
        break
      case 'File':
        if (isImageFile(filename)) {
          contentLabel = 'gửi ảnh'
        } else if (isVideoFile(filename)) {
          contentLabel = 'gửi video'
        } else if (isAudioFile(filename)) {
          contentLabel = 'gửi âm thanh'
        } else {
          contentLabel = 'gửi file'
        }
        break
      case 'Text':
        // eslint-disable-next-line no-case-declarations
        const text = stripHtmlTags(filename)
        contentLabel = truncateText(text, maxLength)
        break
    }
  }

  if (!contentLabel) return ''

  return senderLabel ? `${senderLabel}: ${contentLabel}` : contentLabel
}
