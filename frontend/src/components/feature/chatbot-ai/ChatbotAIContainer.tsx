import { useDeleteChatbotConversation, useRenameChatbotConversation } from '@/hooks/useChatbotAPI'
import throttle from '@/hooks/useThrottle'
import { Button, Dialog, Flex, ScrollArea, Text } from '@radix-ui/themes'
import { useFrappeEventListener } from 'frappe-react-sdk'
import React, { useEffect, useState } from 'react'
import { FiEdit3, FiMessageSquare, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'

export interface ChatSession {
  id: string
  title: string
  creation: string
  messages: { role: 'user' | 'ai'; content: string }[]
}

interface Props {
  sessions: ChatSession[]
  selectedId: string | null
  onSelectSession: (id: string) => void
  onUpdateSessions: (sessions: ChatSession[]) => void
  onNewSession?: () => void
  mutateConversations?: () => void
}

const ChatbotAIContainer: React.FC<Props> = ({
  sessions,
  selectedId,
  onSelectSession,
  onUpdateSessions,
  onNewSession,
  mutateConversations
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const { call: deleteConversation } = useDeleteChatbotConversation()
  const { call: renameConversation } = useRenameChatbotConversation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [pendingRename, setPendingRename] = useState<{ id: string; title: string } | null>(null)
  const { workspaceID } = useParams<{ workspaceID: string; channelID: string }>()
  const navigate = useNavigate()

  // Hàm tự động tạo tên từ câu hỏi đầu tiên
  const generateTitleFromFirstMessage = (message: string) => {
    // Loại bỏ các ký tự đặc biệt và dấu câu
    const cleanMessage = message.replace(/[^\p{L}\s]/gu, '').trim()
    // Tách thành các từ và lấy tối đa 6 từ
    const words = cleanMessage.split(/\s+/).slice(0, 6)
    // Nối lại thành câu và thêm dấu ... nếu bị cắt
    const title = words.join(' ')
    return words.length < cleanMessage.split(/\s+/).length ? `${title}...` : title
  }

  // Hàm cập nhật tên đoạn chat
  const updateSessionTitle = async (id: string, title: string) => {
    try {
      // Cập nhật UI tạm thời để hiển thị trạng thái đang xử lý
      setPendingRename({ id, title: 'Đang đổi tên...' })

      // Gọi API đổi tên
      await renameConversation({
        conversation_id: id,
        title: title
      })
    } catch (error) {
      console.error('Error updating conversation title:', error)
      // Nếu lỗi, khôi phục lại tên cũ
      setPendingRename(null)
    }
  }

  // Lắng nghe sự kiện cập nhật tên từ server
  useFrappeEventListener('raven:update_conversation_title', (data) => {
    if (data.conversation_id) {
      // Cập nhật UI ngay lập tức với tên mới
      const updatedSessions = sessions.map((s) =>
        s.id === data.conversation_id ? { ...s, title: data.new_title, creation: data.creation } : s
      )
      onUpdateSessions(updatedSessions)
      setPendingRename(null)
    }
  })

  // Lắng nghe sự kiện tin nhắn mới để tự động đổi tên
  useFrappeEventListener('new_message', (data) => {
    const currentSession = sessions.find((s) => s.id === data.conversation_id)
    if (currentSession && currentSession.title.startsWith('Đoạn chat mới') && data.is_user) {
      const newTitle = generateTitleFromFirstMessage(data.message)
      updateSessionTitle(currentSession.id, newTitle)
    }
  })

  // Thêm xử lý realtime cho tin nhắn AI
  useFrappeEventListener('raven:new_ai_message', (data) => {
    const currentSession = sessions.find((s) => s.id === data.conversation_id)
    if (currentSession) {
      // Cập nhật tin nhắn mới vào session
      const updatedSessions = sessions.map((s) => {
        if (s.id === data.conversation_id) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                role: 'ai' as const,
                content: data.message
              }
            ]
          }
        }
        return s
      })
      onUpdateSessions(updatedSessions)
    }
  })

  // Thêm xử lý lỗi và reconnect
  useFrappeEventListener('raven:error', (error) => {
    console.error('Socket error:', error)
    // Implement reconnection logic here if needed
  })

  // Theo dõi thay đổi trong messages để cập nhật tên
  useEffect(() => {
    const currentSession = sessions.find((s) => s.id === selectedId)
    if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
      const firstUserMessage = currentSession.messages.find((m) => m.role === 'user')
      if (firstUserMessage && currentSession.title.startsWith('Đoạn chat mới')) {
        const newTitle = generateTitleFromFirstMessage(firstUserMessage.content)
        updateSessionTitle(currentSession.id, newTitle)
      }
    }
  }, [sessions, selectedId])

  const throttledNewSession = throttle(() => {
    if (onNewSession) onNewSession()
  }, 2000)

  const handleNewSession = () => {
    throttledNewSession()
  }
  const handleEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditValue(title)
  }

  const handleEditSave = async (id: string) => {
    if (editValue.trim() && editValue.trim() !== sessions.find((s) => s.id === id)?.title) {
      await updateSessionTitle(id, editValue.trim())
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleDelete = async (id: string) => {
    await deleteConversation({ doctype: 'ChatConversation', name: id })
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    mutateConversations && mutateConversations()
    if (selectedId === id && sessions.length > 1) onSelectSession(sessions.find((s) => s.id !== id)!.id)
    if (sessions.length <= 1) onSelectSession('')
    setDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  const openDeleteDialog = (id: string) => {
    setSessionToDelete(id)
    setDeleteDialogOpen(true)
  }
  const handleNavigate = (id: string) => {
    onSelectSession(id)
    navigate(`/${workspaceID}/chatbot/${id}`)
  }

  return (
    <div className='h-full w-full bg-[#171717] overflow-hidden flex flex-col'>
      {/* Header với nút New Chat */}
      <div className='p-4 border-b border-white/10'>
        <button
          onClick={handleNewSession}
          className='w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-transparent border border-white/20 text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm'
        >
          <FiPlus size={16} />
          New chat
        </button>
      </div>

      {/* Chat Sessions List */}
      <div className='flex-1 overflow-hidden'>
        <ScrollArea type='hover' scrollbars='vertical' className='h-full px-2'>
          <div className='py-2'>
            {sessions
              .sort((a, b) => {
                // Đoạn chat mới luôn ở trên cùng
                if (a.title.startsWith('Đoạn chat mới') && !b.title.startsWith('Đoạn chat mới')) return -1
                if (!a.title.startsWith('Đoạn chat mới') && b.title.startsWith('Đoạn chat mới')) return 1
                // Sắp xếp theo thời gian tạo (mới nhất lên trên)
                return new Date(b.creation).getTime() - new Date(a.creation).getTime()
              })
              .map((s) => (
                <div
                  key={s.id}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 mx-2 mb-1 rounded-lg text-sm transition-all duration-200 cursor-pointer select-none ${
                    selectedId === s.id ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={() => handleNavigate(s.id)}
                >
                  <FiMessageSquare size={16} className='flex-shrink-0 opacity-70' />

                  {editingId === s.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEditSave(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(s.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className='flex-1 bg-transparent outline-none border-b border-white/20 text-white px-1 py-1 text-sm'
                      style={{ minWidth: 0 }}
                    />
                  ) : (
                    <span className='truncate flex-1 min-w-0' title={s.title}>
                      {pendingRename?.id === s.id ? (
                        <span className='italic text-white/50'>{pendingRename.title}</span>
                      ) : (
                        s.title
                      )}
                    </span>
                  )}

                  {/* Action buttons */}
                  <div
                    className='flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEdit(s.id, s.title)}
                      className='p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors'
                    >
                      <FiEdit3 size={14} />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(s.id)}
                      className='p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-red-400 transition-colors'
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

            {sessions.length === 0 && (
              <div className='px-4 py-8 text-center'>
                <FiMessageSquare size={24} className='mx-auto mb-3 text-white/30' />
                <Text className='text-white/50 text-sm'>No conversations yet</Text>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content className='bg-[#2f2f2f] border border-white/10 max-w-md'>
          <Dialog.Title className='text-white text-lg font-semibold mb-4'>Delete chat?</Dialog.Title>
          <Dialog.Description className='text-white/70 text-sm mb-6 leading-relaxed'>
            This will delete the conversation permanently. You cannot undo this action.
          </Dialog.Description>

          <Flex gap='3' justify='end'>
            <Dialog.Close>
              <Button
                variant='ghost'
                className='px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 border border-white/20 rounded-lg transition-colors'
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => sessionToDelete && handleDelete(sessionToDelete)}
              className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border-0'
            >
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default ChatbotAIContainer
