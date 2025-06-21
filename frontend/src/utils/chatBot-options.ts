import { ConversationData, Message } from '@/types/ChatBot/types'

export const generateTitleFromFirstMessage = (message: string): string => {
  const cleanMessage = message.replace(/[^\p{L}\s]/gu, '').trim()
  const words = cleanMessage.split(/\s+/).slice(0, 6)
  const title = words.join(' ')
  return words?.length < cleanMessage.split(/\s+/)?.length ? `${title}...` : title
}

export const normalizeConversations = (conversations: any): ConversationData[] => {
  if (Array.isArray(conversations)) return conversations
  if (Array.isArray(conversations?.message)) return conversations.message
  return []
}

export const normalizeMessages = (messages: any): Message[] => {
  const messageArray = Array.isArray(messages) ? messages : Array.isArray(messages?.message) ? messages.message : []
  return messageArray?.map((m: any) => ({
    role: m.is_user ? ('user' as const) : ('ai' as const),
    content: m.message as string,
    id: m.id,
    parent_message_id: m.parent_message_id,
    message_type: m.message_type,
    file: m.file
  }))
}
