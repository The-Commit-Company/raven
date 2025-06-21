// hooks/useNotificationAudio.ts
import { useEffect, useRef, useState } from 'react'

export const useNotificationAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayedMessageIdRef = useRef<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}notification-new.mp3`)
    audio.volume = 0.9
    audio.preload = 'auto'

    const handleCanPlay = () => {
      setIsLoaded(true)
    }

    audio.addEventListener('canplaythrough', handleCanPlay)

    audio.load()
    audioRef.current = audio

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
    }
  }, [])

  const play = (messageId?: string) => {
    if (!audioRef.current || !isLoaded) return
    if (messageId && messageId === lastPlayedMessageIdRef.current) return

    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})

    if (messageId) {
      lastPlayedMessageIdRef.current = messageId
    }
  }

  return { play }
}
