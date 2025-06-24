import { UserAvatar } from '@/components/common/UserAvatar'
import { useGetUser } from '@/hooks/useGetUser'
import { Message } from '@/types/ChatBot/types'
import { UserContext } from '@/utils/auth/UserProvider'
import { Button, Text, Tooltip } from '@radix-ui/themes'
import clsx from 'clsx'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BiSolidSend } from 'react-icons/bi'
import { FiArrowLeft, FiCpu, FiPaperclip, FiRefreshCw } from 'react-icons/fi'
import { commonButtonStyle } from '../labels/LabelItemMenu'
import ChatbotFileMessage from './ChatbotFileMessage'

interface Props {
  session: { id: string; title: string; messages: Message[] }
  // Input props
  input: string
  onInputChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  // File props
  selectedFile: File | null
  fileError: string | null
  onFileSelect: (file: File) => void
  onRemoveFile: () => void
  allowedFileTypes: string[]
  maxFileSize: number
  // Message props
  isThinking: boolean
  hasMore: boolean
  onShowMore: () => void
  startIdx: number
  // Loading props
  loading?: boolean
  // Reload props
  onReload?: () => void
  thinkingTimeout?: number // milliseconds, default 30000 (30s)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || filePath
}

const ChatbotAIChatBox: React.FC<Props> = ({
  session,
  input,
  onInputChange,
  onKeyDown,
  onSubmit,
  selectedFile,
  fileError,
  onFileSelect,
  onRemoveFile,
  allowedFileTypes,
  isThinking,
  hasMore,
  onShowMore,
  startIdx,
  loading = false,
  onReload,
  thinkingTimeout = 30000 // 30 seconds default
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesTopRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { currentUser } = useContext(UserContext)
  const user = useGetUser(currentUser)

  const [showReloadButton, setShowReloadButton] = useState(false)
  const [thinkingDuration, setThinkingDuration] = useState(0)

  // Timer for thinking duration
  useEffect(() => {
    if (isThinking) {
      setThinkingDuration(0)
      setShowReloadButton(false)

      // Start timer to show reload button after timeout
      thinkingTimerRef.current = setTimeout(() => {
        setShowReloadButton(true)
      }, thinkingTimeout)

      // Update thinking duration every second
      const durationTimer = setInterval(() => {
        setThinkingDuration((prev) => prev + 1)
      }, 1000)

      return () => {
        if (thinkingTimerRef.current) {
          clearTimeout(thinkingTimerRef.current)
        }
        clearInterval(durationTimer)
      }
    } else {
      // Reset when not thinking
      setShowReloadButton(false)
      setThinkingDuration(0)
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
        thinkingTimerRef.current = null
      }
    }
  }, [isThinking, thinkingTimeout])

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session.messages, isThinking])

  // File input handlers
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemoveFileClick = useCallback(() => {
    onRemoveFile()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onRemoveFile])

  // Drag and drop handlers
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleShowMoreClick = useCallback(() => {
    onShowMore()
    setTimeout(() => {
      messagesTopRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [onShowMore])

  const handleInputChangeInternal = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value)
    },
    [onInputChange]
  )

  const handleReload = useCallback(() => {
    if (onReload) {
      onReload()
    }
  }, [onReload])

  const formatThinkingTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className='flex flex-col w-full h-screen'>
      {/* Header */}
      <div className='border-b px-4 py-2 bg-white dark:bg-gray-2 border-gray-200 dark:border-gray-600'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {/* Back button - chỉ hiển thị trên mobile */}
            <button
              onClick={() => window.history.back()}
              className='md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            >
              <FiArrowLeft className='text-gray-600 dark:text-gray-400' size={18} />
            </button>

            <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center'>
              <FiCpu className='text-white' size={16} />
            </div>
            <span className='font-semibold text-gray-800 dark:text-white'>Trợ lý ảo</span>
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
              onClick={handleShowMoreClick}
              className='text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'
            >
              Show earlier messages
            </Button>
          </div>
        )}

        {session.messages?.length === 0 && !isThinking && (
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
          {session.messages?.map((msg, idx) => (
            <div key={msg.id || startIdx + idx} className='group mb-8'>
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
                      {msg.role === 'user' ? user?.full_name || 'Bạn' : 'Trợ lý ảo'}
                    </span>
                  </div>

                  {/* Regular message content */}
                  {msg.message_type !== 'File' && (
                    <div className={`prose prose-sm max-w-none ${msg.pending ? 'opacity-70' : ''}`}>
                      <div
                        className='text-gray-800 dark:text-gray-200 text-[15px] font-normal leading-relaxed'
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}

                  {/* File message content */}
                  {msg.message_type === 'File' && (
                    <div className={`${msg.pending ? 'opacity-70' : ''}`}>
                      {/* Text content if any */}
                      {msg.content && (
                        <div className='mb-3'>
                          <div
                            className='text-gray-800 dark:text-gray-200 text-[15px] font-normal leading-relaxed'
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      )}

                      {/* File attachment */}
                      {msg.file && (
                        <div className={`${msg.pending ? 'opacity-70' : ''} mt-2`}>
                          <ChatbotFileMessage fileUrl={msg.file} fileName={getFileName(msg.file)} />
                        </div>
                      )}
                    </div>
                  )}
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
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>Trợ lý ảo</span>
                    {thinkingDuration > 0 && (
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {formatThinkingTime(thinkingDuration)}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-1 text-gray-500 dark:text-gray-400'>
                      <div className='flex gap-1'>
                        <div className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse'></div>
                        <div
                          className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse'
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse'
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                    </div>

                    {/* Reload button - shows after timeout */}
                    {showReloadButton && onReload && (
                      <Tooltip content='Reload nếu phản hồi quá lâu'>
                        <button
                          onClick={handleReload}
                          className='flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md transition-colors'
                        >
                          <FiRefreshCw size={12} />
                          <span>Reload</span>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='border-t border-gray-200 dark:border-white/10 bg-white dark:bg-gray-2 px-4 py-4'>
        <div className='max-w-3xl mx-auto'>
          {/* File preview */}
          {selectedFile && (
            <div className='mb-3'>
              <ChatbotFileMessage fileUrl={URL.createObjectURL(selectedFile)} fileName={selectedFile.name} />
              <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                Dung lượng: {formatFileSize(selectedFile.size)}
                <button
                  onClick={handleRemoveFileClick}
                  className='ml-4 text-red-500 hover:underline text-xs cursor-pointer'
                >
                  Xoá tệp
                </button>
              </div>
            </div>
          )}
          {/* File error */}
          {fileError && (
            <div className='mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <Text className='text-red-600 dark:text-red-400 text-sm'>
                {fileError || 'Lỗi không xác định xin vui lòng thử lại !'}
              </Text>
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={onSubmit}
            className='flex items-center gap-3 bg-gray-50 dark:bg-gray-3 px-4 py-3 rounded-full border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-gray-4 dark:focus-within:ring-white/10 transition-all'
          >
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className='hidden'
              accept={allowedFileTypes.join(',')}
            />

            {/* File attachment button */}
            <Tooltip content='Đính kèm tệp tin'>
              <button
                type='button'
                onClick={handleFileClick}
                className='flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors'
                disabled={loading}
              >
                <FiPaperclip size={18} />
              </button>
            </Tooltip>

            <textarea
              ref={textAreaRef}
              value={input}
              onChange={handleInputChangeInternal}
              onKeyDown={onKeyDown}
              placeholder='Nhắn tin cho ChatBot...'
              disabled={loading}
              rows={1}
              style={{
                fontFamily: commonButtonStyle.fontFamily
              }}
              className={clsx(
                `flex-1 resize-none border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none max-h-32 min-h-[24px] font-medium text-sm`
              )}
            />

            <button
              type='submit'
              disabled={(!input.trim() && !selectedFile) || loading}
              className={`p-2 rounded-full transition-colors ${
                (!input.trim() && !selectedFile) || loading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-white text-white dark:text-black hover:bg-blue-700 dark:hover:bg-gray-200'
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
