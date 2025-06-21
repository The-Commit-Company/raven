import { useFrappeEventListener } from 'frappe-react-sdk'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useTypingIndicator = (channel: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const removeUserFromTyping = useCallback((user: string) => {
    setTypingUsers((prev) => prev.filter((u) => u !== user))

    const timeout = timeoutsRef.current.get(user)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(user)
    }
  }, [])

  const addUserToTyping = useCallback(
    (user: string) => {
      setTypingUsers((prev) => {
        if (!prev.includes(user)) {
          return [...prev, user]
        }
        return prev
      })

      const existingTimeout = timeoutsRef.current.get(user)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      const newTimeout = setTimeout(() => {
        removeUserFromTyping(user)
      }, 5000)

      timeoutsRef.current.set(user, newTimeout)
    },
    [removeUserFromTyping]
  )

  useFrappeEventListener('raven_typing', (data: { user: string; channel: string }) => {
    if (data.channel !== channel) return
    addUserToTyping(data.user)
  })

  useFrappeEventListener('raven_stop_typing', (data: { user: string; channel: string }) => {
    if (data.channel !== channel) return
    removeUserFromTyping(data.user)
  })

  useEffect(() => {
    return () => {
      timeoutsRef.current?.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  return typingUsers
}
