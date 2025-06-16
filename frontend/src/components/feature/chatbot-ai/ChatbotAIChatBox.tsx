import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { UserContext } from '@/utils/auth/UserProvider'
import { Box, Button, Flex, IconButton, Text, TextArea } from '@radix-ui/themes'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FiMoreVertical, FiPaperclip, FiX } from 'react-icons/fi'
import { BiSolidSend } from 'react-icons/bi'
import { useFrappeEventListener } from 'frappe-react-sdk'

// Thêm type cho message để có thuộc tính pending
interface Message {
  role: 'user' | 'ai'
  content: string
  id?: number
  parent_message_id?: number
  pending?: boolean
}

interface Props {
  session: { id: string; title: string; messages: Message[] }
  onSendMessage: (content: string, file?: File, context?: { role: 'user' | 'ai'; content: string }[]) => void
  loading?: boolean
  onUpdateMessages?: (messages: Message[]) => void
}

const MESSAGES_PER_PAGE = 15

const ChatbotAIChatBox: React.FC<Props> = ({ session, onSendMessage, loading, onUpdateMessages }) => {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesTopRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useContext(UserContext)
  const user = useGetUser(currentUser)
  const [isThinking, setIsThinking] = useState(false)
  const [lastUserMessageId, setLastUserMessageId] = useState<number>(-1)
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_PAGE)
  const [localMessages, setLocalMessages] = useState<Message[]>([])

  // Cập nhật localMessages khi session thay đổi
  useEffect(() => {
    setLocalMessages(session.messages)
    // Kiểm tra tin nhắn cuối cùng để cập nhật trạng thái
    if (session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1]
      if (lastMessage.role === 'user') {
        setIsThinking(true)
        setLastUserMessageId(session.messages.length - 1)
      } else if (lastMessage.role === 'ai') {
        setIsThinking(false)
      }
    }
  }, [session.messages])

  // Khi đổi session thì reset visibleCount
  useEffect(() => {
    setVisibleCount(MESSAGES_PER_PAGE)
  }, [session.id])

  // Tự động cuộn xuống cuối khi vào đoạn chat hoặc có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  // Tự động cuộn xuống khi trạng thái "AI đang suy nghĩ" xuất hiện
  useEffect(() => {
    if (isThinking) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isThinking])

  // Thêm xử lý realtime cho tin nhắn AI
  useFrappeEventListener('raven:new_ai_message', (data) => {
    if (data.conversation_id === session.id) {
      // Cập nhật tin nhắn mới vào local state
      const updatedMessages = [...localMessages, {
        role: 'ai' as const,
        content: data.message
      }]
      setLocalMessages(updatedMessages)
      // Gọi callback để cập nhật parent component
      onUpdateMessages?.(updatedMessages)
      setIsThinking(false)
    }
  })

  // Thêm xử lý lỗi và reconnect
  useFrappeEventListener('raven:error', (error) => {
    console.error('Socket error:', error)
    // Implement reconnection logic here if needed
  })

  // Cập nhật tin nhắn khi session thay đổi
  useEffect(() => {
    if (session) {
      setLocalMessages(session.messages)
      // Không tự động cập nhật trạng thái khi chuyển tab
      // Chỉ cập nhật khi có tin nhắn mới
    }
  }, [session])

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return

    // Lấy toàn bộ tin nhắn trong cuộc trò chuyện làm context
    const context = localMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    const newMessage: Message = {
      role: 'user',
      content: input.trim(),
      pending: true
    }

    setLocalMessages(prev => [...prev, newMessage])
    setInput('')
    setSelectedFile(null)
    setIsThinking(true)

    // Gửi tin nhắn kèm toàn bộ context
    onSendMessage(input.trim(), selectedFile || undefined, context)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Tính toán các tin nhắn hiển thị
  const totalMessages = localMessages.length
  const startIdx = Math.max(0, totalMessages - visibleCount)
  const visibleMessages = localMessages.slice(startIdx)
  const hasMore = startIdx > 0

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + MESSAGES_PER_PAGE)
    setTimeout(() => {
      messagesTopRef.current?.scrollIntoView({ behavior: 'auto' })
    }, 100)
  }

  return (
    <div className='h-full w-full bg-gray-1 dark:bg-[#18191b] flex flex-col'>
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
      <div 
        className='flex-1 overflow-y-auto custom-scrollbar p-4 text-sm text-gray-12 bg-gray-1 dark:bg-[#18191b]'
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
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
              className={`rounded-lg px-4 py-2 max-w-[70%] ${
                msg.role === 'user' 
                  ? 'bg-accent-3 text-right' 
                  : 'bg-gray-3 dark:bg-gray-4'
              }`}
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
            <Box className='rounded-lg px-4 py-2 max-w-[70%] bg-gray-3 dark:bg-gray-4' style={{ fontSize: '15px', lineHeight: '1.6' }}>
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
      <div className='p-4 border-t border-gray-4 dark:border-gray-6 bg-gray-1 dark:bg-[#18191b]'>
        {/* File preview */}
        {selectedFile && (
          <div className='mb-2 p-2 bg-gray-3 dark:bg-gray-4 rounded-md flex items-center justify-between'>
            <Text size='2' className='text-gray-11'>
              {selectedFile.name}
            </Text>
            <IconButton variant='ghost' color='gray' onClick={handleRemoveFile}>
              <FiX />
            </IconButton>
          </div>
        )}
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            handleSend()
          }}
          className='flex flex-col gap-0'
        >
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileSelect}
            className='hidden'
            accept='image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
          />
          {/* Khung nhập tin nhắn */}
          <div className='rounded-t-md border border-gray-5 dark:border-gray-6 bg-gray-2 dark:bg-[#232428] focus-within:border-accent-8'>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Nhập tin nhắn... (Shift + Enter để xuống dòng)'
              className='w-full text-sm text-gray-12 bg-transparent border-none outline-none resize-none min-h-[60px] max-h-[150px] shadow-none p-0 align-top'
              rows={1}
              style={{ resize: 'none' }}
              disabled={loading}
            />
          </div>
          {/* Footer chức năng */}
          <div className='rounded-b-md border-x border-b border-gray-5 dark:border-gray-6 bg-gray-3 dark:bg-[#18191b] flex items-center justify-end px-2 py-1 gap-1'>
            <IconButton 
              type='button'
              variant='ghost' 
              color='gray'
              onClick={handleFileClick}
              className='hover:bg-gray-3 dark:hover:bg-gray-4 text-gray-11'
              title='Đính kèm file'
            >
              <FiPaperclip />
            </IconButton>
            <IconButton 
              type='submit' 
              disabled={(!input.trim() && !selectedFile) || loading} 
              className='hover:bg-accent-9 dark:hover:bg-accent-8 text-white'
              title='Gửi tin nhắn'
            >
              <BiSolidSend />
            </IconButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatbotAIChatBox
