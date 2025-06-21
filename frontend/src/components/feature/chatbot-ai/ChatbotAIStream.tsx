import BeatLoader from '@/components/layout/Loaders/BeatLoader'
import { useChatbotConversations, useCreateChatbotConversation } from '@/hooks/useChatbotAPI'
import { useThrottleAsync } from '@/hooks/useThrottleAsync'
import { ConversationData } from '@/types/ChatBot/types'
import { normalizeConversations } from '@/utils/chatBot-options'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatbotAIContainer, { ChatSession } from './ChatbotAIContainer'

const ChatbotAIStream = () => {
  // Lấy danh sách conversation từ backend
  const [selectedAISessionId, setSelectedAISessionId] = useState<string | null>(null)
  const {
    data: conversations,
    mutate: mutateConversations,
    isLoading: loadingConversations
  } = useChatbotConversations()
  const { call: createConversation } = useCreateChatbotConversation()
  const { workspaceID } = useParams<{ workspaceID: string; channelID: string }>()
  const navigate = useNavigate()

  // Chuyển đổi dữ liệu conversation sang ChatSession cho UI
  const sessions: ChatSession[] = useMemo(() => {
    return normalizeConversations(conversations)?.map((c: ConversationData) => ({
      id: c.name,
      title: c.title,
      creation: c.creation,
      messages: []
    }))
  }, [conversations])

  // Hàm tạo session mới
  const throttledHandleNewSession = useThrottleAsync(
    useCallback(async () => {
      const title = `Đoạn chat mới ${sessions?.length + 1}`
      try {
        const res = await createConversation({ title })
        await mutateConversations()
        setSelectedAISessionId(res.message.name)
        navigate(`/${workspaceID}/chatbot/${res.message.name}`)
      } catch (error) {
        console.error('Error creating new session:', error)
      }
    }, [createConversation, mutateConversations, sessions?.length]),
    3000
  )

  // Hàm update tiêu đề session
  const handleUpdateAISessions = useCallback(
    (updatedSessions: ChatSession[]) => {
      const newConversations = updatedSessions?.map((s) => ({
        name: s.id,
        title: s.title,
        creation: s.creation
      }))
      mutateConversations(newConversations, false)
    },
    [mutateConversations]
  )

  // Nếu selectedAISessionId không còn trong danh sách backend, tự động bỏ chọn hoặc chọn session đầu tiên
  useEffect(() => {
    if (selectedAISessionId && !sessions.find((s) => s.id === selectedAISessionId)) {
      setSelectedAISessionId(sessions?.length > 0 ? sessions[0].id : null)
    }
  }, [sessions, selectedAISessionId])

  // Lắng nghe realtime event update_conversation_title
  useFrappeEventListener('raven:update_conversation_title', (data) => {
    if (data.conversation_id) {
      // Cập nhật conversations trong cache
      mutateConversations((oldData: any[] | undefined) => {
        const oldConversations = oldData || []
        return oldConversations?.map((c: any) =>
          c.name === data.conversation_id ? { ...c, title: data.new_title, creation: data.creation } : c
        )
      }, false) // false để không revalidate với server
    }
  })

  if (loadingConversations) {
    return <BeatLoader text='Đang tải tin nhắn...' />
  }

  return (
    <ChatbotAIContainer
      sessions={sessions}
      selectedId={selectedAISessionId}
      onSelectSession={setSelectedAISessionId}
      onUpdateSessions={handleUpdateAISessions}
      onNewSession={throttledHandleNewSession}
      mutateConversations={mutateConversations}
    />
  )
}

export default ChatbotAIStream
