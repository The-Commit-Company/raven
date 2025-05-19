import { useFrappeAuth, useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

// Dữ liệu cache dạng Map<channelId, { data: any[], timestamp: number }>
const seenUsersCache = new Map<string, { data: any[]; timestamp: number }>()

// Thời gian cache còn hiệu lực (VD: 30 giây)
const CACHE_TTL = 30 * 1000

export const useChannelSeenUsers = (channelId: string) => {
  const { currentUser } = useFrappeAuth()
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const { call: trackSeen } = useFrappePostCall('raven.api.raven_channel_member.track_seen')

  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedChannelId = useDebounce(channelId, 300)

  const fetchSeenUsers = useCallback(
    async (force = false) => {
      if (!debouncedChannelId) return

      const cached = seenUsersCache.get(debouncedChannelId)
      const now = Date.now()

      // Nếu có cache hợp lệ và không force
      if (cached && !force && now - cached.timestamp < CACHE_TTL) {
        setSeenUsers(cached.data)
        return
      }

      setLoading(true)
      try {
        const { message = [] } = await getSeenCall({ channel_id: debouncedChannelId })
        const data = Array.isArray(message) ? message : []
        seenUsersCache.set(debouncedChannelId, { data, timestamp: now }) // Cache lại
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

  useEffect(() => {
    if (debouncedChannelId) {
      trackSeen({ channel_id: debouncedChannelId }).catch((err) => console.error('Error tracking seen:', err))
      fetchSeenUsers()
    }
  }, [debouncedChannelId, fetchSeenUsers, trackSeen])

  useFrappeEventListener('channel_seen_updated', (data: any) => {
    if (data.channel_id === debouncedChannelId && data.user !== currentUser) {
      fetchSeenUsers(true) // Force refetch nếu có socket update
    }
  })

  return { seenUsers, loading, refetch: () => fetchSeenUsers(true) }
}
