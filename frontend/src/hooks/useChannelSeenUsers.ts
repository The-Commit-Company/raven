import { useFrappeAuth, useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from './useDebounce'

// Dữ liệu cache seenUsers dạng Map<channelId, { data: any[], timestamp: number }>
const seenUsersCache = new Map<string, { data: any[]; timestamp: number }>()

// TTL cho cache (30 giây)
const CACHE_TTL = 30 * 1000

// Debounce tracking seen để tránh spam
const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

export const useChannelSeenUsers = (channelId: string) => {
  const { currentUser } = useFrappeAuth()
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const { call: trackSeen } = useFrappePostCall('raven.api.raven_channel_member.track_seen')

  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedChannelId = useDebounce(channelId, 300)
  const lastTrackedAt = useRef(0)

  // Gọi API get_seen_info và cache kết quả
  const fetchSeenUsers = useCallback(
    async (force = false) => {
      if (!debouncedChannelId) return

      const cached = seenUsersCache.get(debouncedChannelId)
      const now = Date.now()

      if (cached && !force && now - cached.timestamp < CACHE_TTL) {
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

  // Hàm track seen có debounce 5s và không gọi nếu vừa gọi gần đây
  const safeTrackSeen = useCallback(
    debounce((channel_id: string) => {
      const now = Date.now()
      if (now - lastTrackedAt.current > 5000) {
        trackSeen({ channel_id }).catch((err) => console.error('Track seen failed:', err))
        lastTrackedAt.current = now
      }
    }, 500),
    [trackSeen]
  )

  // Khi channelId thay đổi → track seen và fetch seen info
  useEffect(() => {
    if (debouncedChannelId) {
      safeTrackSeen(debouncedChannelId)
      fetchSeenUsers()
    }
  }, [debouncedChannelId, fetchSeenUsers, safeTrackSeen])

  // Lắng nghe khi có người khác cập nhật seen
  useFrappeEventListener('channel_seen_updated', (data: any) => {
    if (data.channel_id === debouncedChannelId && data.user !== currentUser) {
      fetchSeenUsers(true) // Force refetch khi có socket update
    }
  })

  // Lắng nghe khi có tin nhắn mới trong kênh
  useFrappeEventListener('new_message', (data: any) => {
    if (data.channel_id === debouncedChannelId && data.user !== currentUser) {
      safeTrackSeen(data.channel_id) // Đánh dấu đã seen
      fetchSeenUsers(true) // Cập nhật danh sách seen realtime
    }
  })

  return {
    seenUsers,
    loading,
    refetch: () => fetchSeenUsers(true)
  }
}
