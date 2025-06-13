import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useRef } from 'react'

export const useTyping = (channel: string) => {
  const { call } = useFrappePostCall('raven.api.realtime_typing.set_typing')
  const isTypingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const sendTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      call({ channel })
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
    }, 5000)
  }, [channel])

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    onUserType: sendTyping
  }
}
