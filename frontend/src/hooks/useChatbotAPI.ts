import { useFrappeGetCall, useFrappeGetDoc, useFrappePostCall } from 'frappe-react-sdk'

// Lấy danh sách cuộc trò chuyện Chatbot AI
export function useChatbotConversations() {
  return useFrappeGetCall<any[]>('raven.api.chatbot.get_conversations', undefined, 'chatbot_conversations', {
    revalidateOnFocus: false
  })
}

// Tạo cuộc trò chuyện mới
export function useCreateChatbotConversation() {
  return useFrappePostCall<any>('raven.api.chatbot.create_conversation')
}

// Lấy danh sách tin nhắn của 1 conversation
export function useChatbotMessages(conversation_id?: string) {
  return useFrappeGetCall<any[]>(
    'raven.api.chatbot.get_messages',
    conversation_id ? { conversation_id } : undefined,
    conversation_id ? ['chatbot_messages', conversation_id] : undefined,
    { revalidateOnFocus: false }
  )
}

// Gửi tin nhắn mới
export function useSendChatbotMessage() {
  return useFrappePostCall<any>('raven.api.chatbot.send_message')
}

// Đổi tên cuộc trò chuyện
export function useRenameChatbotConversation() {
  return useFrappePostCall<any>('raven.api.chatbot.rename_conversation')
}

// Xóa cuộc trò chuyện
export function useDeleteChatbotConversation() {
  return useFrappePostCall<any>('frappe.client.delete')
}

// Lấy 1 conversation kèm bảng con messages (chuẩn Frappe)
export function useChatbotConversationWithMessages(conversation_id?: string) {
  return useFrappeGetDoc<any>('ChatConversation', conversation_id || '')
}
