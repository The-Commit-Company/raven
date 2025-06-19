// hooks/singleton/useSavedMessageStore.ts
import { useEffect, useState } from 'react'
import { Message } from '../../../types/Messaging/Message'

let _messages: Message[] = []
let _setMessages: React.Dispatch<React.SetStateAction<Message[]>> | null = null

export const useSavedMessageStore = () => {
  const [messages, setMessages] = useState<Message[]>(_messages)

  useEffect(() => {
    _setMessages = setMessages
    return () => {
      _setMessages = null
    }
  }, [])

  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    _messages = updater(_messages)
    _setMessages?.([..._messages])
  }

  return { messages, setMessages: updateMessages }
}

export const savedMessageStore = {
  get messages() {
    return _messages
  },
  pushMessage(message: Message) {
    if (!_messages.find((m) => m.name === message.name)) {
      _messages.push(message)
      _setMessages?.([..._messages])
    }
  },
  removeMessage(messageId: string) {
    _messages = _messages.filter((m) => m.name !== messageId)
    _setMessages?.([..._messages])
  }
}
