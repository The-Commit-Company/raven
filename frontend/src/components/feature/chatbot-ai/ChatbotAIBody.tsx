import ChatbotAIChatBox from '@/components/feature/chatbot-ai/ChatbotAIChatBox'
import { ChatSession } from '@/components/feature/chatbot-ai/ChatbotAIContainer'
import { useChatbotConversations, useChatbotMessages, useSendChatbotMessage } from '@/hooks/useChatbotAPI'
import { Message } from '@/types/ChatBot/types'
import { normalizeConversations, normalizeMessages } from '@/utils/chatBot-options'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ChatStreamLoader from '../chat/ChatStream/ChatStreamLoader'

const ChatbotAIBody = ({ botID }: { botID?: string }) => {
  const { data: conversations } = useChatbotConversations()
  // Lấy messages từ backend
  const { data: messages, mutate: mutateMessages, isLoading: loadingMessages } = useChatbotMessages(botID || undefined)

  const [socketConnected, setSocketConnected] = useState(true)

  const [localMessages, setLocalMessages] = useState<Message[]>([])

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
  // Memoized send message handler
  const handleSendMessage = useCallback(
    async (content: string, file?: File, context?: { role: 'user' | 'ai'; content: string }[]) => {
      if (!botID) return

      try {
        await sendMessage({
          conversation_id: botID,
          message: content,
          file,
          context
        })
        await mutateMessages()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    },
    [botID, sendMessage, mutateMessages]
  )

  useEffect(() => {
    setLocalMessages(normalizeMessages(messages))
  }, [messages])

  // Thêm xử lý realtime cho tin nhắn AI
  useFrappeEventListener('raven:new_ai_message', (data) => {
    if (data.conversation_id === botID) {
      const updated = [...localMessages, { role: 'ai', content: data.message }]
      setLocalMessages(updated as Message[])
    }
  })

  useFrappeEventListener('raven:error', (error) => {
    console.error('Socket error:', error)
    setSocketConnected(false)
    setTimeout(() => {
      window.location.reload()
    }, 5000)
  })

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout

    if (!socketConnected) {
      pollingInterval = setInterval(() => {
        mutateMessages()
      }, 3000)
    }

    return () => clearInterval(pollingInterval)
  }, [socketConnected])

  // Early return if no session is selected
  if (!selectedSession || !botID) {
    return <ChatStreamLoader />
  }

  return (
    <ChatbotAIChatBox
      session={{
        id: botID,
        title: selectedSession.title,
        messages: localMessages
      }}
      onSendMessage={handleSendMessage}
      onUpdateMessages={setLocalMessages} // callback cập nhật
      loading={sending || loadingMessages}
    />
  )
}

export default ChatbotAIBody
