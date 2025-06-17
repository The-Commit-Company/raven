import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { Message } from '@/types/ChatBot/types'
import { UserContext } from '@/utils/auth/UserProvider'
import { Button, Text } from '@radix-ui/themes'
import { useFrappeEventListener } from 'frappe-react-sdk'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BiSolidSend } from 'react-icons/bi'
import { FiCpu, FiPaperclip, FiX } from 'react-icons/fi'

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

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

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
    <div className='flex flex-col h-full w-full'>
      {/* Header */}
      <div className='border-b px-4 py-2 bg-white dark:bg-gray-2 border-gray-200 dark:border-gray-600'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center'>
              <FiCpu className='text-white' size={16} />
            </div>
            <span className='font-semibold text-gray-800 dark:text-white'>ChatGPT</span>
          </div>
          <UserAvatar
            src={user?.user_image}
            alt={user?.full_name ?? user?.name}
            size='2'
            variant='solid'
            radius='full'
            className='border-2 border-gray-200 dark:border-gray-600'
          />
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto bg-white dark:bg-gray-2' onDrop={handleDrop} onDragOver={handleDragOver}>
        <div ref={messagesTopRef} />

        {hasMore && (
          <div className='flex justify-center py-4'>
            <Button
              size='2'
              variant='ghost'
              onClick={handleShowMore}
              className='text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'
            >
              Show earlier messages
            </Button>
          </div>
        )}

        {localMessages.length === 0 && (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center'>
                <FiCpu className='text-white' size={32} />
              </div>
              <Text className='text-gray-500 dark:text-gray-400 text-lg'>How can I help you today?</Text>
            </div>
          </div>
        )}

        <div className='max-w-3xl mx-auto p-4'>
          {visibleMessages.map((msg, idx) => (
            <div key={startIdx + idx} className='group mb-8'>
              <div className='flex gap-4 items-start'>
                {/* Avatar */}
                <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center'>
                  {msg.role === 'user' ? (
                    <UserAvatar
                      src={user?.user_image}
                      alt={user?.full_name ?? user?.name}
                      size='2'
                      variant='solid'
                      radius='full'
                      className='border border-gray-200 dark:border-gray-600'
                    />
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center'>
                      <FiCpu className='text-white' size={16} />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className='flex-1 min-w-0'>
                  <div className='mb-1'>
                    <span className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>
                      {msg.role === 'user' ? user?.full_name || 'You' : 'ChatGPT'}
                    </span>
                  </div>
                  <div className={`prose prose-sm max-w-none ${msg.pending ? 'opacity-70' : ''}`}>
                    <div
                      className='text-gray-800 dark:text-gray-200 leading-relaxed'
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AI thinking indicator */}
          {isThinking && (
            <div className='group mb-8'>
              <div className='flex gap-4 items-start'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center'>
                  <FiCpu className='text-white' size={16} />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='mb-1'>
                    <span className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>ChatGPT</span>
                  </div>
                  <div className='flex items-center gap-1 text-gray-500 dark:text-gray-400'>
                    <div className='flex gap-1'>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-pulse'></div>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-pulse'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-pulse'
                        style={{ animationDelay: '0.4s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='border-t border-black/10 dark:border-white/10 bg-white dark:bg-gray-2 px-4 py-4'>
        <div className='max-w-3xl mx-auto'>
          {/* File preview */}
          {selectedFile && (
            <div className='mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <FiPaperclip className='text-gray-500 dark:text-gray-400' size={16} />
                <Text className='text-gray-700 dark:text-gray-300 text-sm'>{selectedFile.name}</Text>
              </div>
              <button
                onClick={handleRemoveFile}
                className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors'
              >
                <FiX className='text-gray-500 dark:text-gray-400' size={16} />
              </button>
            </div>
          )}

          {/* File error */}
          {fileError && (
            <div className='mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <Text className='text-red-600 dark:text-red-400 text-sm'>{fileError}</Text>
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className='flex items-center gap-3 dark:bg-gray-3 px-4 py-3 rounded-full focus-within:ring-2 ring-white/10 transition-all'
          >
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileSelect}
              className='hidden'
              accept={ALLOWED_FILE_TYPES.join(',')}
            />
            {/* File attachment button */}
            <button
              type='button'
              onClick={handleFileClick}
              className='flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors'
              disabled={loading}
            >
              <FiPaperclip size={18} />
            </button>
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Message ChatGPT...'
              disabled={loading}
              rows={1}
              className='flex-1 resize-none border-none bg-transparent text-white placeholder-gray-400 outline-none max-h-32 min-h-[24px]'
            />
            <button
              type='submit'
              disabled={(!input.trim() && !selectedFile) || loading}
              className={`p-2 rounded-full transition-colors ${
                (!input.trim() && !selectedFile) || loading
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <BiSolidSend size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatbotAIChatBox
