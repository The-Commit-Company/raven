import { UserContext } from '@/utils/auth/UserProvider'
import { useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

const arraysAreEqual = (arr1: any[], arr2: any[]) => {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false
  }
  return true
}

function debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
  let timer: NodeJS.Timeout | null = null
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

export const useChannelSeenUsers = (channelId: string) => {
  const { currentUser } = useContext(UserContext)
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const { call: trackSeenCall } = useFrappePostCall('raven.api.raven_channel_member.track_seen')

  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const seenUsersRef = useRef<any[]>([])
  const pendingSeenUpdate = useRef(false)
  const hasUnreadWhileHidden = useRef(false)

  const fetchSeenUsers = useCallback(async () => {
    if (!channelId || pendingSeenUpdate.current) return
    setLoading(true)
    try {
      const { message = [] } = await getSeenCall({ channel_id: channelId })
      const data = Array.isArray(message) ? message : []
      if (!arraysAreEqual(seenUsersRef.current, data)) {
        setSeenUsers(data)
        seenUsersRef.current = data
      }
    } catch (err) {
      console.error('Failed to fetch seen users:', err)
    } finally {
      setLoading(false)
    }
  }, [channelId, getSeenCall])

  const trackSeen = useCallback(
    debounce(async () => {
      if (!channelId) return
      pendingSeenUpdate.current = true
      try {
        await trackSeenCall({ channel_id: channelId })
      } catch (err) {
        console.error('Track seen failed:', err)
      } finally {
        pendingSeenUpdate.current = false
      }
    }, 1000),
    [channelId, trackSeenCall]
  )

  useEffect(() => {
    if (channelId) {
      trackSeen()
      fetchSeenUsers()
    }
  }, [channelId, trackSeen, fetchSeenUsers])

  useFrappeEventListener('channel_seen_updated', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser) {
      fetchSeenUsers()
    }
  })

  const isTabActive = () => !document.hidden && document.visibilityState === 'visible'

  useFrappeEventListener('new_message', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser) {
      if (isTabActive()) {
        trackSeen()
      } else {
        hasUnreadWhileHidden.current = true
      }
    }
  })

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isTabActive() && hasUnreadWhileHidden.current) {
        hasUnreadWhileHidden.current = false
        trackSeen()
        fetchSeenUsers()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }, [trackSeen, fetchSeenUsers])

  return {
    seenUsers,
    loading,
    refetch: fetchSeenUsers
  }
}
