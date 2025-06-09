import { UserContext } from '@/utils/auth/UserProvider'
import { useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

const arraysAreEqual = (arr1: any[], arr2: any[]) => {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].user !== arr2[i].user || arr1[i].seen_at !== arr2[i].seen_at) {
      return false
    }
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

export const useChannelSeenUsers = ({ channelId }: { channelId: string }) => {
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
        seenUsersRef.current = data
        setSeenUsers(data)
      }
    } catch (err) {
      console.error('Failed to fetch seen users:', err)
    } finally {
      setLoading(false)
    }
  }, [channelId, getSeenCall])

  const trackSeen = useCallback(
    debounce(async () => {
      if (!channelId || pendingSeenUpdate.current) return
      pendingSeenUpdate.current = true
      try {
        await trackSeenCall({ channel_id: channelId })
      } catch (err) {
        console.error('Track seen failed:', err)
      } finally {
        pendingSeenUpdate.current = false
      }
    }, 1500),
    [channelId, trackSeenCall]
  )

  const isTabActive = () => !document.hidden && document.visibilityState === 'visible'

  const updateSeenUserFromSocket = useCallback(
    (data: any) => {
      if (data.channel_id !== channelId || data.user === currentUser) return
      setSeenUsers((prev) => {
        const idx = prev.findIndex((u) => u.user === data.user)
        if (idx !== -1) {
          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            seen_at: data.seen_at,
            full_name: data.full_name || updated[idx].full_name,
            user_image: data.user_image || updated[idx].user_image
          }
          seenUsersRef.current = updated
          return updated
        }
        const added = [
          ...prev,
          {
            user: data.user,
            seen_at: data.seen_at,
            full_name: data.full_name,
            user_image: data.user_image
          }
        ]
        seenUsersRef.current = added
        return added
      })
    },
    [channelId, currentUser]
  )

  // INIT
  useEffect(() => {
    if (channelId) {
      fetchSeenUsers()
      trackSeen()
    }
  }, [channelId, fetchSeenUsers, trackSeen])

  // SOCKET: update khi có người seen
  useFrappeEventListener('raven:channel_seen_updated', updateSeenUserFromSocket)

  // SOCKET: khi có tin nhắn mới
  useFrappeEventListener('new_message', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser) {
      if (isTabActive()) {
        trackSeen()
      } else {
        hasUnreadWhileHidden.current = true
      }
    }
  })

  // HANDLE visibility change
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
    refetch: fetchSeenUsers,
    refetchWithTrackSeen: () => {
      trackSeen()
    }
  }
}
