import React, { useEffect, useState, useRef } from 'react'
import ChatbotAIChatBox from './ChatbotAIChatBox'
import { ChatSession } from './ChatbotAIContainer'
import ChatbotAIContainer from './ChatbotAIContainer'
import {
  useChatbotConversations,
  useChatbotMessages,
  useCreateChatbotConversation,
  useRenameChatbotConversation,
  useSendChatbotMessage
} from '@/hooks/useChatbotAPI'
import { useFrappeEventListener } from 'frappe-react-sdk'

interface Message {
  role: 'user' | 'ai'
  content: string
  pending?: boolean
}

// Hàm chuyển đổi file sang base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

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
  const lastUserMessageRef = useRef<string | null>(null)
  const [isSending, setIsSending] = useState(false)

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
        setDisplayMessages(mapped)
        setIsWaitingAI(false)
      }
  }, [messages, selectedId])

  // Khi conversations thay đổi, đồng bộ lại displaySessions và kiểm tra pendingRenames
  useEffect(() => {
    if (conversations) {
      setDisplaySessions(
        conversations.map((c: any) => ({
          id: c.name,
          title: c.title,
          creation: c.creation,
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

  // Lắng nghe realtime event new_message
  useFrappeEventListener('new_message', (data) => {
    if (data.channel_id === selectedId) {
      // Cập nhật tin nhắn ngay lập tức
      setDisplayMessages(prev => {
        const newMessage = {
          role: data.is_user ? 'user' as const : 'ai' as const,
          content: data.message as string
        }
        
        // Nếu là tin nhắn AI và đang có tin nhắn pending, thay thế nó
        if (!data.is_user && prev.length > 0 && prev[prev.length - 1].pending) {
          return [...prev.slice(0, -1), newMessage]
        }
        
        // Nếu là tin nhắn mới, thêm vào cuối
        return [...prev, newMessage]
      })
      
      // Nếu là tin nhắn AI, tắt trạng thái đang chờ
      if (!data.is_user) {
        setIsWaitingAI(false)
      }
      
      // Cập nhật lại danh sách tin nhắn từ backend
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
  const handleSendMessage = async (content: string, file?: File, context?: { role: 'user' | 'ai'; content: string }[]) => {
    if (!selectedId) return

    try {
      setIsSending(true)
      const response = await fetch('/api/method/raven.api.chatbot_ai.send_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: selectedId,
          message: content,
          file: file ? await fileToBase64(file) : undefined,
          context: context || [] // Đảm bảo context luôn là một mảng
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      if (data.message) {
        // Cập nhật tin nhắn trong session hiện tại
        const updatedSessions = sessionsForUI.map(s => {
          if (s.id === selectedId) {
            return {
              ...s,
              messages: [...s.messages, {
                role: 'user' as const,
                content: content
              }, {
                role: 'ai' as const,
                content: data.message
              }],
              isThinking: false
            }
          }
          return s
        })
        setDisplaySessions(updatedSessions)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  // Render sessions: nếu có trong pendingRenames thì hiển thị Đang xử lý...
  const sessionsForUI = displaySessions.map((s) => (pendingRenames[s.id] ? { ...s, title: 'Đang xử lý...' } : s))

  const handleUpdateMessages = (messages: Message[]) => {
    // Cập nhật tin nhắn trong session hiện tại
    const updatedSessions = sessionsForUI.map(s => {
      if (s.id === selectedId) {
        const lastMessage = messages[messages.length - 1]
        return {
          ...s,
          messages,
          // Chỉ hiển thị trạng thái AI đang suy nghĩ khi tin nhắn cuối là của user
          isThinking: lastMessage?.role === 'user'
        }
      }
      return s
    })
    setDisplaySessions(updatedSessions)
  }

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
          mutateConversations={mutateConversations}
        />
      </div>
      {/* Chatbox */}
      <div className='flex-1 h-full'>
        {selectedId ? (
          <ChatbotAIChatBox
            session={sessionsForUI.find(s => s.id === selectedId)!}
            onSendMessage={handleSendMessage}
            loading={sending || loadingMessages}
            onUpdateMessages={handleUpdateMessages}
          />
        ) : (
          <div className='flex items-center justify-center h-full text-gray-6'>Chọn một đoạn chat để bắt đầu</div>
        )}
      </div>
    </div>
  )
}

export default ChatbotAIPage
