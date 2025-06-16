import { useDeleteChatbotConversation, useRenameChatbotConversation } from '@/hooks/useChatbotAPI'
import { Box, ScrollArea, Text, Dialog, Button, Flex } from '@radix-ui/themes'
import React, { useState, useEffect } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useFrappeEventListener } from 'frappe-react-sdk'

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
  const [pendingRename, setPendingRename] = useState<{id: string, title: string} | null>(null)

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
      const updatedSessions = sessions.map(s => 
        s.id === data.conversation_id 
          ? { ...s, title: data.new_title, creation: data.creation }
          : s
      )
      onUpdateSessions(updatedSessions)
      setPendingRename(null)
    }
  })

  // Lắng nghe sự kiện tin nhắn mới để tự động đổi tên
  useFrappeEventListener('new_message', (data) => {
    const currentSession = sessions.find(s => s.id === data.conversation_id)
    if (currentSession && currentSession.title.startsWith('Đoạn chat mới') && data.is_user) {
      const newTitle = generateTitleFromFirstMessage(data.message)
      updateSessionTitle(currentSession.id, newTitle)
    }
  })

  // Thêm xử lý realtime cho tin nhắn AI
  useFrappeEventListener('raven:new_ai_message', (data) => {
    const currentSession = sessions.find(s => s.id === data.conversation_id)
    if (currentSession) {
      // Cập nhật tin nhắn mới vào session
      const updatedSessions = sessions.map(s => {
        if (s.id === data.conversation_id) {
          return {
            ...s,
            messages: [...s.messages, {
              role: 'ai' as const,
              content: data.message
            }]
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
    const currentSession = sessions.find(s => s.id === selectedId)
    if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
      const firstUserMessage = currentSession.messages.find(m => m.role === 'user')
      if (firstUserMessage && currentSession.title.startsWith('Đoạn chat mới')) {
        const newTitle = generateTitleFromFirstMessage(firstUserMessage.content)
        updateSessionTitle(currentSession.id, newTitle)
      }
    }
  }, [sessions, selectedId])

  const handleNewSession = () => {
    if (onNewSession) return onNewSession()
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

  return (
    <div className='h-full w-full bg-gray-1 dark:bg-[#111113] overflow-hidden flex flex-col'>
      {/* Header */}
      <div className='border-b border-gray-4 dark:border-gray-6 px-3 py-3'>
        <span className='font-medium text-base text-gray-12'>Chatbot AI</span>
      </div>
      {/* Danh sách đoạn chat + nút tạo mới */}
      <Box className='flex flex-col gap-2 p-4 bg-gray-1 dark:bg-[#111113]'>
        <button
          onClick={handleNewSession}
          className='text-sm font-semibold rounded-md bg-violet-10 hover:bg-violet-11 text-gray-12 dark:text-white transition-all mb-2 px-3 py-2 w-full'
        >
          + Đoạn chat mới
        </button>
        <ScrollArea
          type='hover'
          scrollbars='vertical'
          className='max-h-[60vh] rounded-md border border-gray-4 dark:border-gray-6 bg-gray-1 dark:bg-[#111113]'
        >
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
              className={`group flex items-center px-3 py-1.5 rounded-md text-sm text-gray-12 font-normal cursor-pointer transition-all mb-1 select-none ${
                selectedId === s.id 
                  ? 'bg-gray-4 dark:bg-gray-5 font-semibold' 
                  : 'hover:bg-gray-3 dark:hover:bg-gray-4'
              }`}
              onClick={() => onSelectSession(s.id)}
            >
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
                  className='flex-1 bg-transparent outline-none border-b border-gray-5 text-gray-12 px-1 mr-2 text-sm py-1'
                  style={{ minWidth: 0 }}
                />
              ) : (
                <span className='truncate flex-1 min-w-0' title={s.title}>
                  {pendingRename?.id === s.id ? (
                    <span className='italic text-gray-11'>{pendingRename.title}</span>
                  ) : (
                    s.title
                  )}
                </span>
              )}
              <span
                className='flex gap-2 items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={(e) => e.stopPropagation()}
              >
                <FiEdit2
                  className='hover:text-violet-9 cursor-pointer'
                  size={16}
                  onClick={() => handleEdit(s.id, s.title)}
                />
                <FiTrash2 
                  className='hover:text-red-9 cursor-pointer' 
                  size={16} 
                  onClick={() => openDeleteDialog(s.id)} 
                />
              </span>
            </div>
          ))}
          {sessions.length === 0 && <Text className='p-3 text-gray-6'>Chưa có đoạn chat nào</Text>}
        </ScrollArea>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content className='bg-gray-1 dark:bg-[#18191b]'>
          <Dialog.Title className='text-gray-12'>Xác nhận xóa</Dialog.Title>
          <Dialog.Description className='text-gray-11 mt-4'>
            Bạn có chắc chắn muốn xóa đoạn chat này? Hành động này không thể hoàn tác.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button 
                variant="soft" 
                color="gray"
                className='bg-gray-3 dark:bg-gray-4 text-gray-12'
              >
                Hủy
              </Button>
            </Dialog.Close>
            <Button 
              variant="solid" 
              color="red" 
              onClick={() => sessionToDelete && handleDelete(sessionToDelete)}
              className='bg-red-9 hover:bg-red-10 text-white'
            >
              Xóa
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default ChatbotAIContainer
