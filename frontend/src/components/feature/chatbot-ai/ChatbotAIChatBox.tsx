import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { Message } from '@/types/ChatBot/types'
import { UserContext } from '@/utils/auth/UserProvider'
import { Box, Button, Flex, IconButton, Text, TextArea } from '@radix-ui/themes'
import { useFrappeEventListener } from 'frappe-react-sdk'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BiSolidSend } from 'react-icons/bi'
import { FiMoreVertical, FiPaperclip, FiX } from 'react-icons/fi'

interface Props {
  session: { id: string; title: string; messages: Message[] }
  onSendMessage: (content: string, file?: File, context?: { role: 'user' | 'ai'; content: string }[]) => void
  loading?: boolean
  onUpdateMessages?: (messages: Message[]) => void
}

const MESSAGES_PER_PAGE = 15
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']

const ChatbotAIChatBox: React.FC<Props> = ({ session, onSendMessage, loading = false, onUpdateMessages }) => {
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_PAGE)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesTopRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const { currentUser } = useContext(UserContext)
  const user = useGetUser(currentUser)

  // Memoize visible messages calculation
  const { visibleMessages, hasMore, startIdx } = useMemo(() => {
    const totalMessages = localMessages.length
    const startIdx = Math.max(0, totalMessages - visibleCount)
    return {
      visibleMessages: localMessages.slice(startIdx),
      hasMore: startIdx > 0,
      startIdx
    }
  }, [localMessages, visibleCount])

  // Update local messages when session changes
  useEffect(() => {
    setLocalMessages(session.messages)

    if (session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1]
      setIsThinking(lastMessage.role === 'user')
    }
  }, [session.messages])

  // Reset visible count when session changes
  useEffect(() => {
    setVisibleCount(MESSAGES_PER_PAGE)
  }, [session.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, isThinking])

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }, [])

  // Memoized send handler
  const handleSend = useCallback(() => {
    if ((!input.trim() && !selectedFile) || loading) return

    const context = localMessages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }))

    const newMessage: Message = {
      role: 'user',
      content: input.trim(),
      pending: true
    }

    setLocalMessages((prev) => [...prev, newMessage])
    setInput('')
    setSelectedFile(null)
    setFileError(null)
    setIsThinking(true)

    onSendMessage(input.trim(), selectedFile || undefined, context)
  }, [input, selectedFile, loading, localMessages, onSendMessage])

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // File selection handler
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const error = validateFile(file)
        if (error) {
          setFileError(error)
        } else {
          setSelectedFile(file)
          setFileError(null)
        }
      }
    },
    [validateFile]
  )

  // File actions
  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Drag and drop handlers
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) {
        const error = validateFile(file)
        if (error) {
          setFileError(error)
        } else {
          setSelectedFile(file)
          setFileError(null)
        }
      }
    },
    [validateFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Show more messages
  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + MESSAGES_PER_PAGE)
    setTimeout(() => {
      messagesTopRef.current?.scrollIntoView({ behavior: 'auto' })
    }, 100)
  }, [])

  // Event listeners
  useFrappeEventListener('raven:new_ai_message', (data) => {
    if (data.conversation_id === session.id) {
      // Cập nhật tin nhắn mới vào local state
      const updatedMessages = [
        ...localMessages,
        {
          role: 'ai' as const,
          content: data.message
        }
      ]
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

        {localMessages.length === 0 && <Text color='gray'>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</Text>}

        {visibleMessages.map((msg, idx) => (
          <Flex key={startIdx + idx} justify={msg.role === 'user' ? 'end' : 'start'} className='mb-2'>
            <Box
              className={`rounded-lg px-4 py-2 max-w-[70%] ${
                msg.role === 'user' ? 'bg-accent-3 text-right' : 'bg-gray-3 dark:bg-gray-4'
              }`}
              style={{ fontSize: '15px', lineHeight: '1.6' }}
            >
              <Text
                className={`text-sm ${msg.pending ? 'italic text-gray-10' : 'text-gray-12'}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
              </Text>
            </Box>
          </Flex>
        ))}

        {/* AI thinking indicator */}
        {isThinking && (
          <Flex justify='start' className='mb-2'>
            <Box className='rounded-lg px-4 py-2 max-w-[70%] bg-gray-3 dark:bg-gray-4'>
              <div className='flex items-center gap-2'>
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className='w-2 h-2 bg-gray-10 rounded-full animate-bounce'
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
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

        {/* File error */}
        {fileError && (
          <div className='mb-2 p-2 bg-red-3 rounded-md'>
            <Text size='2' className='text-red-11'>
              {fileError}
            </Text>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileSelect}
            className='hidden'
            accept={ALLOWED_FILE_TYPES.join(',')}
          />

          <div className='rounded-t-md border border-gray-5 dark:border-gray-6 bg-gray-2 dark:bg-[#232428] focus-within:border-accent-8'>
            <TextArea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Nhập tin nhắn... (Shift + Enter để xuống dòng)'
              className='w-full text-sm text-gray-12 bg-transparent border-none outline-none resize-none min-h-[60px] max-h-[150px] shadow-none p-0'
              rows={1}
              disabled={loading}
            />
          </div>

          <div className='rounded-b-md border-x border-b border-gray-5 dark:border-gray-6 bg-gray-3 dark:bg-[#18191b] flex items-center justify-end px-2 py-1 gap-1'>
            <IconButton type='button' variant='ghost' color='gray' onClick={handleFileClick} title='Đính kèm file'>
              <FiPaperclip />
            </IconButton>
            <IconButton type='submit' disabled={(!input.trim() && !selectedFile) || loading} title='Gửi tin nhắn'>
              <BiSolidSend />
            </IconButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatbotAIChatBox
