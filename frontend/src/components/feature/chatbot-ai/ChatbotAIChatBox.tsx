import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { UserContext } from '@/utils/auth/UserProvider'
import { Box, Button, Flex, IconButton, Text, TextArea } from '@radix-ui/themes'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FiMoreVertical } from 'react-icons/fi'

// Thêm type cho message để có thuộc tính pending
interface Message {
  role: 'user' | 'ai'
  content: string
  pending?: boolean
}

interface Props {
  session: { id: string; title: string; messages: Message[] }
  onSendMessage: (content: string) => void
  loading?: boolean
}

const MESSAGES_PER_PAGE = 15

const ChatbotAIChatBox: React.FC<Props> = ({ session, onSendMessage, loading }) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesTopRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useContext(UserContext)
  const user = useGetUser(currentUser)
  const [isThinking, setIsThinking] = useState(false)
  const [lastUserMessageId, setLastUserMessageId] = useState<number>(-1)
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_PAGE)

  // Khi đổi session thì reset visibleCount
  useEffect(() => {
    setVisibleCount(MESSAGES_PER_PAGE)
  }, [session.id])

  // Tự động cuộn xuống cuối khi vào đoạn chat hoặc có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session.messages])

  // Tự động cuộn xuống khi trạng thái "AI đang suy nghĩ" xuất hiện
  useEffect(() => {
    if (isThinking) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isThinking])

  // Theo dõi tin nhắn để quản lý trạng thái "AI đang suy nghĩ"
  useEffect(() => {
    if (session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1]

      // Nếu tin nhắn cuối cùng là của người dùng
      if (lastMessage.role === 'user') {
        setIsThinking(true)
        setLastUserMessageId(session.messages.length - 1)
      }
      // Nếu tin nhắn cuối cùng là của AI và trước đó có tin nhắn người dùng
      else if (lastMessage.role === 'ai' && lastUserMessageId !== -1) {
        setIsThinking(false)
      }
    }
  }, [session.messages, lastUserMessageId])

  const handleSend = () => {
    if (!input.trim() || loading) return
    onSendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Nếu nhấn Enter mà không có Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Ngăn chặn hành vi mặc định của textarea
      handleSend()
    }
  }

  // Lấy ra các tin nhắn cần hiển thị
  const totalMessages = session.messages.length
  const startIdx = Math.max(0, totalMessages - visibleCount)
  const visibleMessages = session.messages.slice(startIdx, totalMessages)
  const hasMore = startIdx > 0

  // Khi nhấn nút hiện thêm tin nhắn cũ
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + MESSAGES_PER_PAGE)
    setTimeout(() => {
      messagesTopRef.current?.scrollIntoView({ behavior: 'auto' })
    }, 100) // Đảm bảo scroll tới đúng vị trí sau khi render thêm
  }

  return (
    <div className='h-full w-full bg-[#18191b] flex flex-col'>
      {/* Header */}
      <div className='border-b border-gray-4 dark:border-gray-6 px-3 py-3 flex justify-between items-center'>
        <span className='font-medium text-base text-gray-12'>Chatbot AI</span>
        <Flex gap='3' align='center'>
          <UserAvatar
            src={user?.user_image}
            alt={user?.full_name ?? user?.name}
            size='2'
            variant='solid'
            radius='full'
            className='mt-0.5'
          />
          <IconButton variant='ghost' color='gray'>
            <FiMoreVertical />
          </IconButton>
        </Flex>
      </div>
      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 text-sm text-gray-12'>
        <div ref={messagesTopRef} />
        {hasMore && (
          <div className='flex justify-center mb-2'>
            <Button size='1' variant='soft' onClick={handleShowMore}>
              Hiện thêm tin nhắn cũ
            </Button>
          </div>
        )}
        {totalMessages === 0 && <Text color='gray'>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</Text>}
        {visibleMessages.map((msg, idx) => (
          <Flex key={startIdx + idx} justify={msg.role === 'user' ? 'end' : 'start'} className='mb-2'>
            <Box
              className={`rounded-lg px-4 py-2 max-w-[70%] ${msg.role === 'user' ? 'bg-accent-3 text-right' : 'bg-gray-3'}`}
              style={{ fontSize: '15px', lineHeight: '1.6' }}
            >
              {msg.pending ? (
                <Text className='italic text-gray-10' style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Text>
              ) : (
                <Text className='text-sm text-gray-12' style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Text>
              )}
            </Box>
          </Flex>
        ))}
        {/* Hiển thị trạng thái "AI đang suy nghĩ" */}
        {isThinking && (
          <Flex justify='start' className='mb-2'>
            <Box className='rounded-lg px-4 py-2 max-w-[70%] bg-gray-3' style={{ fontSize: '15px', lineHeight: '1.6' }}>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-gray-10 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                <div
                  className='w-2 h-2 bg-gray-10 rounded-full animate-bounce'
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className='w-2 h-2 bg-gray-10 rounded-full animate-bounce'
                  style={{ animationDelay: '300ms' }}
                ></div>
                <Text className='text-sm text-gray-10 ml-2'>AI đang suy nghĩ...</Text>
              </div>
            </Box>
          </Flex>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className='p-4 border-t border-gray-4 dark:border-gray-6 bg-[#18191b]'>
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            handleSend()
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Nhập tin nhắn... (Shift + Enter để xuống dòng)'
            className='flex-1 text-sm text-gray-12 bg-[#18191b] border border-gray-5 rounded-md px-3 py-2'
            rows={1}
            style={{ resize: 'none' }}
            disabled={loading}
          />
          <Button type='submit' disabled={!input.trim() || loading} className='text-sm'>
            Gửi
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatbotAIChatBox
