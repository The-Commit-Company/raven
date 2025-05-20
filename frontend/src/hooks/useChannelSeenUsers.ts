import { useFrappeAuth, useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

const seenUsersCache = new Map<string, { data: any[]; timestamp: number }>()
const seenTrackTimestamps = new Map<string, number>()

const CACHE_TTL = 30 * 1000 // 30s
const TRACK_SEEN_COOLDOWN = 5 * 1000 // 5s

export const useChannelSeenUsers = (channelId: string) => {
  const { currentUser } = useFrappeAuth()
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const { call: trackSeen } = useFrappePostCall('raven.api.raven_channel_member.track_seen')

  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedChannelId = useDebounce(channelId, 300)

  // Track seen nhưng có cooldown
  const safeTrackSeen = useCallback(
    (id: string) => {
      const now = Date.now()
      const last = seenTrackTimestamps.get(id) || 0
      if (now - last > TRACK_SEEN_COOLDOWN) {
        trackSeen({ channel_id: id }).catch(console.error)
        seenTrackTimestamps.set(id, now)
      }
    },
    [trackSeen]
  )

  // Fetch seen users (with optional force refetch)
  const fetchSeenUsers = useCallback(
    async (force = false) => {
      if (!debouncedChannelId) return

      const now = Date.now()

      if (force) {
        seenUsersCache.delete(debouncedChannelId)
      }

      const cached = seenUsersCache.get(debouncedChannelId)
      if (cached && now - cached.timestamp < CACHE_TTL) {
        setSeenUsers(cached.data)
        return
      }

      setLoading(true)
      try {
        const { message = [] } = await getSeenCall({ channel_id: debouncedChannelId })
        const data = Array.isArray(message) ? message : []
        seenUsersCache.set(debouncedChannelId, { data, timestamp: now })
        setSeenUsers(data)
      } catch (err) {
        console.error('Failed to fetch seen users:', err)
        setSeenUsers([])
      } finally {
        setLoading(false)
      }
    },
    [debouncedChannelId, getSeenCall]
  )

  // Khi vào kênh => track seen + fetch seen users
  useEffect(() => {
    if (debouncedChannelId) {
      safeTrackSeen(debouncedChannelId)
      fetchSeenUsers()
    }
  }, [debouncedChannelId, fetchSeenUsers, safeTrackSeen])

  // Khi có socket realtime "channel_seen_updated"
  useFrappeEventListener('channel_seen_updated', (data: any) => {
    if (data.channel_id === debouncedChannelId && data.user !== currentUser) {
      fetchSeenUsers(true)
    }
  })

  // Khi có tin nhắn mới → track seen + refetch
  useFrappeEventListener('new_message', (data: any) => {
    if (data.channel_id === debouncedChannelId && data.user !== currentUser) {
      safeTrackSeen(data.channel_id)
      fetchSeenUsers(true)
    }
  })

  return {
    seenUsers,
    loading,
    refetch: () => fetchSeenUsers(true)
  }
}
