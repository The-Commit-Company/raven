import ChatbotAIBody from '@/components/feature/chatbot-ai/ChatbotAIBody'
import { useParams } from 'react-router-dom'

const ChatBotPage = () => {
  const { botID } = useParams()

  return <ChatbotAIBody botID={botID} />
}

export const Component = ChatBotPage
