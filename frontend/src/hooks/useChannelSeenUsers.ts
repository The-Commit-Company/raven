import { useFrappePostCall } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'

export const useChannelSeenUsers = (channelId: string) => {
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeenUsers = async () => {
      try {
        if (!channelId) return
        const result = await getSeenCall({ channel_id: channelId })
        setSeenUsers(result.message || [])
      } catch (err) {
        console.error('Failed to fetch seen users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSeenUsers()
  }, [channelId])

  return { seenUsers, loading }
}
