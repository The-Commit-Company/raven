import React, { useState } from 'react';
import ChatbotAIContainer, { ChatSession } from './ChatbotAIContainer';
import ChatbotAIChatBox from './ChatbotAIChatBox';
import { useChatbotConversations, useCreateChatbotConversation, useChatbotMessages, useSendChatbotMessage } from '@/hooks/useChatbotAPI';

const ChatbotAIPage: React.FC = () => {
  // State quản lý session được chọn
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Lấy danh sách conversation từ backend
  const { data: conversations, mutate: mutateConversations, isLoading: loadingConversations } = useChatbotConversations();
  const { call: createConversation } = useCreateChatbotConversation();

  // Khi chọn session, lấy messages từ backend
  const { data: messages, mutate: mutateMessages, isLoading: loadingMessages } = useChatbotMessages(selectedId || undefined);
  const { call: sendMessage, loading: sending } = useSendChatbotMessage();

  // Chuyển đổi dữ liệu conversation sang ChatSession cho UI
  const sessions: ChatSession[] = (conversations || []).map((c: any) => ({
    id: c.name,
    title: c.title,
    messages: [] // sẽ lấy riêng khi chọn
  }));

  // Hàm tạo session mới
  const handleNewSession = async () => {
    const title = `Đoạn chat mới ${sessions.length + 1}`;
    const res = await createConversation({ title });
    await mutateConversations();
    setSelectedId(res.message.name);
  };

  // Hàm update tiêu đề session (chỉ update local UI, không update backend)
  const handleUpdateSessions = (newSessions: ChatSession[]) => {
    // Không làm gì vì chỉ lấy từ backend, có thể mở rộng nếu muốn update title trên backend
  };

  // Hàm gửi tin nhắn
  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;
    await sendMessage({ conversation_id: selectedId, message: content });
    await mutateMessages();
  };

  // Chuyển đổi dữ liệu messages cho ChatBox
  const chatMessages = (messages || []).map((m: any) => ({
    role: m.is_user ? 'user' as const : 'ai' as const,
    content: m.message as string
  }));

  return (
    <div className="flex h-full w-full">
      {/* Sidebar session */}
      <div className="w-[320px] border-r border-gray-4 dark:border-gray-6 h-full">
        <ChatbotAIContainer
          sessions={sessions}
          selectedId={selectedId}
          onSelectSession={setSelectedId}
          onUpdateSessions={handleUpdateSessions}
          onNewSession={handleNewSession}
        />
      </div>
      {/* Chatbox */}
      <div className="flex-1 h-full">
        {selectedId ? (
          <ChatbotAIChatBox
            session={{ id: selectedId, title: sessions.find(s => s.id === selectedId)?.title || '', messages: chatMessages }}
            onSendMessage={handleSendMessage}
            loading={sending || loadingMessages}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-6">Chọn một đoạn chat để bắt đầu</div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAIPage; 