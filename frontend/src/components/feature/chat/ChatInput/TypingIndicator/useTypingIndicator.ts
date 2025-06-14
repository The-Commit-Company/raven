import { useFrappeEventListener } from 'frappe-react-sdk'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useTypingIndicator = (channel: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const removeUserFromTyping = useCallback((user: string) => {
    setTypingUsers((prev) => prev.filter((u) => u !== user))

    // Clear timeout for this user
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

      // Clear existing timeout for this user
      const existingTimeout = timeoutsRef.current.get(user)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout
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

  // Listen for stop typing events
  useFrappeEventListener('raven_stop_typing', (data: { user: string; channel: string }) => {
    if (data.channel !== channel) return
    removeUserFromTyping(data.user)
  })

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      timeoutsRef.current.clear()
    }
  }, [])

  return typingUsers
}
