import React, { useRef, useState, useContext } from 'react';
import { Box, Button, Flex, Text, TextArea, IconButton } from '@radix-ui/themes';
import { ChatSession } from './ChatbotAIContainer';
import { UserAvatar } from '@/components/common/UserAvatar';
import { FiMoreVertical } from 'react-icons/fi';
import { useGetUser } from '@/hooks/useGetUser';
import { UserContext } from '@/utils/auth/UserProvider';

interface Props {
  session: ChatSession;
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

const ChatbotAIChatBox: React.FC<Props> = ({ session, onSendMessage, loading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useContext(UserContext);
  const user = useGetUser(currentUser);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput('');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="h-full w-full bg-[#18191b] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-4 dark:border-gray-6 px-3 py-3 flex justify-between items-center">
        <span className="font-medium text-base text-gray-12">Chatbot AI</span>
        <Flex gap="3" align="center">
          <UserAvatar 
            src={user?.user_image} 
            alt={user?.full_name ?? user?.name} 
            size="2" 
            variant="solid"
            radius="full"
            className="mt-0.5"
          />
          <IconButton variant="ghost" color="gray">
            <FiMoreVertical />
          </IconButton>
        </Flex>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-12">
        {session.messages.length === 0 && (
          <Text color="gray">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</Text>
        )}
        {session.messages.map((msg, idx) => (
          <Flex key={idx} justify={msg.role === 'user' ? 'end' : 'start'} className="mb-2">
            <Box
              className={`rounded-lg px-4 py-2 max-w-[70%] ${msg.role === 'user' ? 'bg-accent-3 text-right' : 'bg-gray-3'}`}
              style={{ fontSize: '15px', lineHeight: '1.6' }}
            >
              <Text className="text-sm text-gray-12">{msg.content}</Text>
            </Box>
          </Flex>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-4 border-t border-gray-4 dark:border-gray-6 bg-[#18191b]">
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 text-sm text-gray-12 bg-[#18191b] border border-gray-5 rounded-md px-3 py-2"
            rows={1}
            style={{ resize: 'none' }}
            disabled={loading}
          />
          <Button type="submit" disabled={!input.trim() || loading} className="text-sm">Gửi</Button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotAIChatBox; 