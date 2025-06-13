import { useFrappeEventListener } from 'frappe-react-sdk'
import { useState } from 'react'

export const useTypingIndicator = (channel: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useFrappeEventListener('raven_typing', (data: { user: string; channel: string }) => {
    if (data.channel !== channel) return

    setTypingUsers((prev) => {
      if (!prev.includes(data.user)) return [...prev, data.user]
      return prev
    })

    setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.user))
    }, 5000)
  })

  return typingUsers
}
