import React, { useState } from 'react';
import { Box, ScrollArea, Text } from '@radix-ui/themes';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useRenameChatbotConversation, useDeleteChatbotConversation } from '@/hooks/useChatbotAPI';

export interface ChatSession {
  id: string;
  title: string;
  messages: { role: 'user' | 'ai'; content: string }[];
}

interface Props {
  sessions: ChatSession[];
  selectedId: string | null;
  onSelectSession: (id: string) => void;
  onUpdateSessions: (sessions: ChatSession[]) => void;
  onNewSession?: () => void;
  mutateConversations?: () => void;
}

const ChatbotAIContainer: React.FC<Props> = ({ sessions, selectedId, onSelectSession, onUpdateSessions, onNewSession, mutateConversations }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const { call: renameConversation } = useRenameChatbotConversation();
  const { call: deleteConversation } = useDeleteChatbotConversation();

  const handleNewSession = () => {
    if (onNewSession) return onNewSession();
  };

  const handleEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditValue(title);
  };

  const handleEditSave = async (id: string) => {
    if (editValue.trim() && editValue.trim() !== sessions.find(s => s.id === id)?.title) {
      await renameConversation({ doctype: 'ChatConversation', name: id, fieldname: 'title', value: editValue.trim() });
      mutateConversations && mutateConversations();
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (id: string) => {
    await deleteConversation({ doctype: 'ChatConversation', name: id });
    mutateConversations && mutateConversations();
    if (selectedId === id && sessions.length > 1) onSelectSession(sessions.find(s => s.id !== id)!.id);
    if (sessions.length <= 1) onSelectSession('');
  };

  return (
    <div className="h-full w-full bg-[#111113] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-4 dark:border-gray-6 px-3 py-3">
        <span className="font-medium text-base text-gray-12">Chatbot AI</span>
      </div>
      {/* Danh sách đoạn chat + nút tạo mới */}
      <Box className="flex flex-col gap-2 p-4 bg-[#111113]">
        <button
          onClick={handleNewSession}
          className="text-sm font-semibold rounded-md bg-violet-9 hover:bg-violet-10 text-white transition-all mb-2 px-3 py-2 w-full"
        >
          + Đoạn chat mới
        </button>
        <ScrollArea type="hover" scrollbars="vertical" className="max-h-[60vh] rounded-md border border-gray-4 dark:border-gray-6 bg-[#111113]">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center px-3 py-1.5 rounded-md text-sm text-gray-12 font-normal cursor-pointer transition-all mb-1 select-none ${selectedId === s.id ? 'bg-gray-4 font-semibold' : 'hover:bg-gray-3'}`}
              onClick={() => onSelectSession(s.id)}
            >
              {editingId === s.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => handleEditSave(s.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEditSave(s.id); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 bg-transparent outline-none border-b border-gray-5 text-gray-12 px-1 mr-2 text-sm py-1"
                  style={{ minWidth: 0 }}
                />
              ) : (
                <span className="truncate flex-1 min-w-0" title={s.title}>{s.title}</span>
              )}
              <span className="flex gap-2 items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <FiEdit2 className="hover:text-violet-9 cursor-pointer" size={16} onClick={() => handleEdit(s.id, s.title)} />
                <FiTrash2 className="hover:text-red-9 cursor-pointer" size={16} onClick={() => handleDelete(s.id)} />
              </span>
            </div>
          ))}
          {sessions.length === 0 && <Text className="p-3 text-gray-6">Chưa có đoạn chat nào</Text>}
        </ScrollArea>
      </Box>
    </div>
  );
};

export default ChatbotAIContainer; 