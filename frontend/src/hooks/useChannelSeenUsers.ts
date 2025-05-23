import { UserContext } from '@/utils/auth/UserProvider'
import { useFrappeEventListener, useFrappePostCall } from 'frappe-react-sdk'
import { useCallback, useContext, useEffect, useState } from 'react'

export const useChannelSeenUsers = (channelId: string) => {
  const { currentUser } = useContext(UserContext)
  const { call: getSeenCall } = useFrappePostCall('raven.api.raven_channel_member.get_seen_info')
  const { call: trackSeen } = useFrappePostCall('raven.api.raven_channel_member.track_seen')

  const [seenUsers, setSeenUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // New states
  const [isTabActive, setIsTabActive] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

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

  // Detect tab visibility & focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden)
    }
    const handleFocus = () => setIsTabActive(true)
    const handleBlur = () => setIsTabActive(false)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Detect user interaction (scroll or keyboard)
  useEffect(() => {
    const onUserInteract = () => setHasUserInteracted(true)
    window.addEventListener('scroll', onUserInteract, { once: true })
    window.addEventListener('keydown', onUserInteract, { once: true })

    return () => {
      window.removeEventListener('scroll', onUserInteract)
      window.removeEventListener('keydown', onUserInteract)
    }
  }, [])

  // Initial fetch and track when channelId changes
  useEffect(() => {
    if (channelId) {
      sendTrackSeen()
      fetchSeenUsers()
    }
  }, [channelId, sendTrackSeen, fetchSeenUsers])

  // Listen to 'channel_seen_updated' event as before
  useFrappeEventListener('channel_seen_updated', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser) {
      fetchSeenUsers()
    }
  })

  // Listen to 'new_message' event, but only track seen if tab active + user interacted
  useFrappeEventListener('new_message', (data: any) => {
    if (data.channel_id === channelId && data.user !== currentUser && isTabActive && hasUserInteracted) {
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
