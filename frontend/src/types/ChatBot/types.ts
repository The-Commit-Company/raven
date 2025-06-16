export interface Message {
  role: 'user' | 'ai'
  content: string
  id?: number
  parent_message_id?: number
  pending?: boolean
}

export interface ChatSession {
  id: string
  title: string
  creation: string
  messages: Message[]
}

export interface ConversationData {
  name: string
  title: string
  creation: string
}
