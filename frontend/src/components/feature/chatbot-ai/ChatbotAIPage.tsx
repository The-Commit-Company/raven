import {
  useChatbotConversations,
  useChatbotMessages,
  useCreateChatbotConversation,
  useRenameChatbotConversation,
  useSendChatbotMessage
} from '@/hooks/useChatbotAPI'
import { useFrappeEventListener } from 'frappe-react-sdk'
import React, { useEffect, useState } from 'react'
import ChatbotAIChatBox from './ChatbotAIChatBox'
import ChatbotAIContainer, { ChatSession } from './ChatbotAIContainer'

const ChatbotAIPage: React.FC = () => {
  // State quản lý session được chọn
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // State hiển thị ra UI, luôn là nguồn dữ liệu render
  const [displayMessages, setDisplayMessages] = useState<{ role: 'user' | 'ai'; content: string; pending?: boolean }[]>(
    []
  )
  const [displaySessions, setDisplaySessions] = useState<ChatSession[]>([]) // State quản lý danh sách đoạn chat hiển thị
  const [pendingRenames, setPendingRenames] = useState<{ [id: string]: string }>({})
  const [isWaitingAI, setIsWaitingAI] = useState(false)
  // const lastUserMessageRef = useRef<string | null>(null)
  // const [pendingMessages, setPendingMessages] = useState<{ role: 'user' | 'ai'; content: string; pending?: boolean }[]>(
  //   []
  // )

  // Lấy danh sách conversation từ backend
  const { data: conversations, mutate: mutateConversations } = useChatbotConversations()
  const { call: createConversation } = useCreateChatbotConversation()
  const { call: renameConversation } = useRenameChatbotConversation()

  // Khi chọn session, lấy messages từ backend
  const {
    data: messages,
    mutate: mutateMessages,
    isLoading: loadingMessages
  } = useChatbotMessages(selectedId || undefined)
  const { call: sendMessage, loading: sending } = useSendChatbotMessage()

  // Khi đổi đoạn chat, đồng bộ lại displayMessages với backend
  useEffect(() => {
    if (messages) {
      const mapped = messages.map((m: any) => ({
        role: m.is_user ? ('user' as const) : ('ai' as const),
        content: m.message as string
      }))
      // Nếu message cuối cùng từ backend khác message cuối cùng trên displayMessages (không tính pending)
      const lastBackendMsg = mapped[mapped.length - 1]?.content
      const nonPendingDisplay = displayMessages.filter((m) => !m.pending)
      const lastDisplayMsg = nonPendingDisplay[nonPendingDisplay.length - 1]?.content
      if (lastBackendMsg !== lastDisplayMsg || mapped.length !== nonPendingDisplay.length) {
        setDisplayMessages(mapped)
        setIsWaitingAI(false)
      }
      // Nếu giống, không update (giữ nguyên displayMessages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedId])

  // Khi conversations thay đổi, đồng bộ lại displaySessions và kiểm tra pendingRenames
  useEffect(() => {
    if (conversations) {
      setDisplaySessions(
        conversations.map((c: any) => ({
          id: c.name,
          title: c.title,
          messages: []
        }))
      )
      // Nếu backend đã cập nhật title, xóa khỏi pendingRenames
      setPendingRenames((prev) => {
        const updated = { ...prev }
        for (const c of conversations) {
          if (updated[c.name] && c.title === updated[c.name]) {
            delete updated[c.name]
          }
        }
        return updated
      })
    }
  }, [conversations])

  // Lắng nghe realtime event new_message để tự động cập nhật khi có tin nhắn mới (user hoặc AI)
  useFrappeEventListener('new_message', (data) => {
    console.log('Realtime event new_message:', data)
    if (data.channel_id === selectedId) {
      mutateMessages()
    }
  })

  // Hàm tạo session mới
  const handleNewSession = async () => {
    const title = `Đoạn chat mới ${displaySessions.length + 1}`
    const res = await createConversation({ title })
    await mutateConversations()
    setSelectedId(res.message.name)
    setDisplayMessages([])
    setIsWaitingAI(false)
  }

  // Đổi tên: set pendingRenames[id]=newTitle, cập nhật UI thành Đang xử lý..., gọi API đổi tên
  const handleUpdateSessions = async (newSessions: ChatSession[]) => {
    // Tìm đoạn chat đang đổi tên
    const pending = newSessions.find((s) => s.title === 'Đang xử lý...')
    if (pending) {
      // Lấy tên mới từ pendingRenames hoặc từ displaySessions (nếu vừa đổi)
      let newTitle = pendingRenames[pending.id]
      if (!newTitle) {
        // Lấy tên mới từ displaySessions (tên cũ trước khi đổi)
        const old = displaySessions.find((s) => s.id === pending.id)
        if (old && old.title !== 'Đang xử lý...') {
          newTitle = old.title
        }
      }
      if (newTitle) {
        setPendingRenames((prev) => ({ ...prev, [pending.id]: newTitle }))
        await renameConversation({ doctype: 'ChatConversation', name: pending.id, fieldname: 'title', value: newTitle })
        await mutateConversations()
        return
      }
    }
    setDisplaySessions(newSessions)
  }

  // Hàm gửi tin nhắn
  const handleSendMessage = async (content: string) => {
    if (!selectedId) return
    setDisplayMessages((prev) => [
      ...prev,
      { role: 'user', content },
      { role: 'ai', content: 'AI đang suy nghĩ...', pending: true }
    ])
    setIsWaitingAI(true)
    try {
      await sendMessage({ conversation_id: selectedId, message: content })
      // Không cần mutateMessages ngay, sẽ tự động fetch lại khi nhận realtime event
    } catch (error) {
      setIsWaitingAI(false)
      // Có thể show lỗi ở đây nếu muốn
      console.error('Error sending message:', error)
    }
  }

  // Render sessions: nếu có trong pendingRenames thì hiển thị Đang xử lý...
  const sessionsForUI = displaySessions.map((s) => (pendingRenames[s.id] ? { ...s, title: 'Đang xử lý...' } : s))

  return (
    <div className='flex h-full w-full'>
      {/* Sidebar session */}
      <div className='w-[320px] border-r border-gray-4 dark:border-gray-6 h-full'>
        <ChatbotAIContainer
          sessions={sessionsForUI}
          selectedId={selectedId}
          onSelectSession={setSelectedId}
          onUpdateSessions={handleUpdateSessions}
          onNewSession={handleNewSession}
        />
      </div>
      {/* Chatbox */}
      <div className='flex-1 h-full'>
        {selectedId ? (
          <ChatbotAIChatBox
            session={{
              id: selectedId,
              title: displaySessions.find((s) => s.id === selectedId)?.title || '',
              messages: displayMessages
            }}
            onSendMessage={handleSendMessage}
            loading={sending || loadingMessages}
          />
        ) : (
          <div className='flex items-center justify-center h-full text-gray-6'>Chọn một đoạn chat để bắt đầu</div>
        )}
      </div>
    </div>
  )
}

export default ChatbotAIPage
