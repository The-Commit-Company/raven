import { UserContext } from '@/utils/auth/UserProvider'
import { useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useContext, useEffect, useState } from 'react'

export const useChannelSeenUsers = (channelId: string) => {
  const { currentUser } = useContext(UserContext)
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const { call: trackSeen } = useFrappePostCall('raven.api.raven_channel_member.track_seen')

  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSeenUsers = useCallback(async () => {
    if (!channelId) return
    setLoading(true)
    try {
      const { message = [] } = await getSeenCall({ channel_id: channelId })
      const data = Array.isArray(message) ? message : []
      setSeenUsers(data)
    } catch (err) {
      console.error('Failed to fetch seen users:', err)
      setSeenUsers([])
    } finally {
      setLoading(false)
    }
  }, [channelId, getSeenCall])

  const sendTrackSeen = useCallback(async () => {
    if (!channelId) return
    try {
      await trackSeen({ channel_id: channelId })
    } catch (err) {
      console.error('Track seen failed:', err)
    }
  }, [channelId, trackSeen])

  useEffect(() => {
    if (channelId) {
      sendTrackSeen()
      fetchSeenUsers()
    }
  }, [channelId, sendTrackSeen, fetchSeenUsers])

  useFrappeEventListener('channel_seen_updated', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser) {
      fetchSeenUsers()
    }
  })

  useFrappeEventListener('new_message', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser) {
      sendTrackSeen()
      fetchSeenUsers()
    }
  })

  return {
    seenUsers,
    loading,
    refetch: fetchSeenUsers
  }
}
