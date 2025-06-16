import { useGetUser } from '@/hooks/useGetUser'
import { useMemo } from 'react'

interface Channel {
  is_direct_message: number
  peer_user_id?: string
  channel_name?: string
  name: string
}

export const useChannelDisplayInfo = (channel: Channel | null) => {
  const isDM = channel?.is_direct_message === 1
  const peerUserId = isDM ? channel?.peer_user_id || '' : ''
  const user = useGetUser(peerUserId)

  const displayName = useMemo(() => {
    if (isDM) return user?.full_name ?? 'Người dùng'
    return channel?.channel_name
  }, [isDM, user?.full_name, channel?.channel_name])

  const avatarChar = useMemo(() => {
    return (displayName?.[0] || '?').toUpperCase()
  }, [displayName])

  return {
    isDM,
    displayName,
    avatarChar,
    user
  }
}
