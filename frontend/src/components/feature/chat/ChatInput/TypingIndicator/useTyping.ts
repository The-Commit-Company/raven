import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useRef } from 'react'

const TYPING_DEBOUNCE_TIME = 2000

export const useTyping = (channel: string) => {
  const { call: setTyping } = useFrappePostCall('raven.api.realtime_typing.set_typing')
  const { call: stopTyping } = useFrappePostCall('raven.api.realtime_typing.stop_typing') // NEW

  const isTypingRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout>()
  const lastCallTimeRef = useRef<number>(0)

  const sendStopTyping = useCallback(async () => {
    if (isTypingRef.current) {
      try {
        await stopTyping({ channel })
        isTypingRef.current = false
      } catch (error) {
        console.error('Failed to send stop typing event:', error)
      }
    }
  }, [channel, stopTyping])

  const sendTypingEvent = useCallback(async () => {
    const now = Date.now()

    if (now - lastCallTimeRef.current < TYPING_DEBOUNCE_TIME) {
      return
    }

    lastCallTimeRef.current = now

    try {
      await setTyping({ channel })
      isTypingRef.current = true
    } catch (error) {
      console.error('Failed to send typing event:', error)
    }
  }, [channel, setTyping])

  const sendTyping = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      sendTypingEvent()
    }, 300)

    stopTypingTimeoutRef.current = setTimeout(() => {
      sendStopTyping()
    }, 5000)
  }, [sendTypingEvent, sendStopTyping])

  const stopTypingManually = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current)
    }
    sendStopTyping()
  }, [sendStopTyping])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current)
      }
      // Stop typing khi component unmount
      if (isTypingRef.current) {
        stopTyping({ channel }).catch(console.error)
      }
    }
  }, [channel, stopTyping])

  return {
    onUserType: sendTyping,
    onStopTyping: stopTypingManually,
    isTyping: isTypingRef.current
  }
}
