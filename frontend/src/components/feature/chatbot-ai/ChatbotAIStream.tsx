import { useChatbotConversations, useCreateChatbotConversation } from '@/hooks/useChatbotAPI'
import { ConversationData } from '@/types/ChatBot/types'
import { normalizeConversations } from '@/utils/chatBot-options'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useEffect, useMemo, useState } from 'react'
import ChatbotAIContainer, { ChatSession } from './ChatbotAIContainer'

const ChatbotAIStream = () => {
  // Lấy danh sách conversation từ backend
  const [selectedAISessionId, setSelectedAISessionId] = useState<string | null>(null)
  const { data: conversations, mutate: mutateConversations } = useChatbotConversations()
  const { call: createConversation } = useCreateChatbotConversation()

  // Chuyển đổi dữ liệu conversation sang ChatSession cho UI
  const sessions: ChatSession[] = useMemo(() => {
    return normalizeConversations(conversations).map((c: ConversationData) => ({
      id: c.name,
      title: c.title,
      creation: c.creation,
      messages: []
    }))
  }, [conversations])

  // Hàm tạo session mới
  const handleNewSession = async () => {
    const title = `Đoạn chat mới ${sessions.length + 1}`
    const res = await createConversation({ title })
    await mutateConversations()
    setSelectedAISessionId(res.message.name)
  }

  // Hàm update tiêu đề session
  const handleUpdateAISessions = (updatedSessions: ChatSession[]) => {
    // Cập nhật state local
    const newConversations = updatedSessions.map((s) => ({
      name: s.id,
      title: s.title,
      creation: s.creation
    }))
    mutateConversations(newConversations, false)
  }

  // Nếu selectedAISessionId không còn trong danh sách backend, tự động bỏ chọn hoặc chọn session đầu tiên
  useEffect(() => {
    if (selectedAISessionId && !sessions.find((s) => s.id === selectedAISessionId)) {
      setSelectedAISessionId(sessions.length > 0 ? sessions[0].id : null)
    }
  }, [sessions, selectedAISessionId])

  // Lắng nghe realtime event new_message cho Chatbot AI
  useFrappeEventListener('new_message', (data) => {
    if (data.channel_id === selectedAISessionId) {
      // mutateMessages()
    }
  })

  // Lắng nghe realtime event update_conversation_title
  useFrappeEventListener('raven:update_conversation_title', (data) => {
    if (data.conversation_id) {
      // Cập nhật conversations trong cache
      mutateConversations((oldData: any[] | undefined) => {
        const oldConversations = oldData || []
        return oldConversations.map((c: any) =>
          c.name === data.conversation_id ? { ...c, title: data.new_title, creation: data.creation } : c
        )
      }, false) // false để không revalidate với server
    }
  })

  return (
    <ChatbotAIContainer
      sessions={sessions}
      selectedId={selectedAISessionId}
      onSelectSession={setSelectedAISessionId}
      onUpdateSessions={handleUpdateAISessions}
      onNewSession={handleNewSession}
      mutateConversations={mutateConversations}
    />
  )
}

export default ChatbotAIStream
