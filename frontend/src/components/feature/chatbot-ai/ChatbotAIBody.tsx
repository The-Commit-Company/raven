import ChatbotAIChatBox from '@/components/feature/chatbot-ai/ChatbotAIChatBox'
import { ChatSession } from '@/components/feature/chatbot-ai/ChatbotAIContainer'
import { useChatbotConversations, useChatbotMessages, useSendChatbotMessage } from '@/hooks/useChatbotAPI'
import { normalizeConversations, normalizeMessages } from '@/utils/chatBot-options'
import { useMemo } from 'react'

const ChatbotAIBody = ({ botID }: { botID?: string }) => {
  const { data: conversations } = useChatbotConversations()
  // Lấy messages từ backend
  const { data: messages, mutate: mutateMessages, isLoading: loadingMessages } = useChatbotMessages(botID || undefined)

  const { call: sendMessage, loading: sending } = useSendChatbotMessage()

  // Chuyển đổi dữ liệu conversation sang ChatSession cho UI
  const sessions: ChatSession[] = useMemo(() => {
    return normalizeConversations(conversations).map((c) => ({
      id: c.name,
      title: c.title,
      creation: c.creation,
      messages: []
    }))
  }, [conversations])

  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === botID) || sessions[0]
  }, [sessions])

  // Hàm gửi tin nhắn Chatbot AI
  const handleSendMessage = async (content: string) => {
    if (!botID) return
    await sendMessage({ conversation_id: botID, message: content })
    await mutateMessages()
  }
  return (
    <ChatbotAIChatBox
      session={{
        id: botID as string,
        title: selectedSession.title,
        messages: normalizeMessages(messages)
      }}
      onSendMessage={handleSendMessage}
      loading={sending || loadingMessages}
    />
  )
}

export default ChatbotAIBody
