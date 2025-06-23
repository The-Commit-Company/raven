import eventBus from '@/utils/event-emitter'
import { useEffect, useState } from 'react'

export function useSavedMessageCount() {
  const [count, setCount] = useState(() => {
    return localStorage.getItem('total_saved_messages') || '0'
  })

  useEffect(() => {
    const handler = (e: { newCount: string }) => {
      setCount(e.newCount)
    }

    eventBus.on('saved:count_changed', handler)

    return () => {
      eventBus.off('saved:count_changed', handler)
    }
  }, [])

  return count
}
