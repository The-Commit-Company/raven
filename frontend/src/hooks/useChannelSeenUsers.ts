import { useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useEffect, useState } from 'react'

export const useChannelSeenUsers = (channelId: string) => {
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSeenUsers = useCallback(async () => {
    if (!channelId) return

    setLoading(true)
    try {
      const { message = [] } = await getSeenCall({ channel_id: channelId })
      setSeenUsers(Array.isArray(message) ? message : [])
    } catch (err) {
      console.error('Failed to fetch seen users:', err)
      setSeenUsers([])
    } finally {
      setLoading(false)
    }
  }, [channelId, getSeenCall])

  useEffect(() => {
    fetchSeenUsers()
  }, [fetchSeenUsers])

  return { seenUsers, loading, refetch: fetchSeenUsers }
}
