// hooks/useNotificationAudio.ts
import { useEffect, useRef } from 'react'

export const useNotificationAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayedMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}notification.mp3`)
    audio.volume = 0.7
    audioRef.current = audio
  }, [])

  const play = (messageId?: string) => {
    if (!audioRef.current) return
    if (messageId && messageId === lastPlayedMessageIdRef.current) return

    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
    if (messageId) lastPlayedMessageIdRef.current = messageId
  }

  return { play }
}
