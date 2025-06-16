import ChatbotAIChatBox from '@/components/feature/chatbot-ai/ChatbotAIChatBox'
import { ChatSession } from '@/components/feature/chatbot-ai/ChatbotAIContainer'
import { useChatbotConversations, useChatbotMessages, useSendChatbotMessage } from '@/hooks/useChatbotAPI'

const ChatbotAIBody = ({ botID }: { botID?: string }) => {
  const { data: conversations } = useChatbotConversations()
  // Lấy messages từ backend
  const { data: messages, mutate: mutateMessages, isLoading: loadingMessages } = useChatbotMessages(botID || undefined)

  const { call: sendMessage, loading: sending } = useSendChatbotMessage()

  // Chuyển đổi dữ liệu conversation sang ChatSession cho UI
  const sessions: ChatSession[] = (
    Array.isArray(conversations)
      ? conversations
      : Array.isArray((conversations as any)?.message)
        ? (conversations as any).message
        : []
  ).map((c: any) => ({
    id: c.name,
    title: c.title,
    creation: c.creation,
    messages: []
  }))

  const selectedSession = sessions.find((s) => s.id === botID) || sessions[0]

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
        messages: (Array.isArray(messages)
          ? messages
          : Array.isArray((messages as any)?.message)
            ? (messages as any).message
            : []
        ).map((m: any) => ({
          role: m.is_user ? ('user' as const) : ('ai' as const),
          content: m.message as string
        }))
      }}
      onSendMessage={handleSendMessage}
      loading={sending || loadingMessages}
    />
  )
}

export default ChatbotAIBody
