import { manuallyMarkedAtom } from '@/utils/atoms/manuallyMarkedAtom'
import { UserContext } from '@/utils/auth/UserProvider'
import { UnreadCountData, useChannelList, useUpdateLastMessageInChannelList } from '@/utils/channel/ChannelListProvider'
import {
  FrappeConfig,
  FrappeContext,
  useFrappeEventListener,
  useFrappeGetCall,
  useFrappePostCall
} from 'frappe-react-sdk'
import { useAtomValue } from 'jotai'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNotificationAudio } from './useNotificationAudio'

export const useUnreadMessageCount = () => {
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)

  const { data: unread_count, mutate: updateCount } = useFrappeGetCall<{ message: UnreadCountData }>(
    'raven.api.raven_message.get_unread_count_for_channels',
    undefined,
    'unread_channel_count',
    {
      focusThrottleInterval: 60 * 1000,
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const totalUnreadCount = useMemo(() => {
    const idsFromServer = new Set(unread_count?.message.map((c) => c.name))
    const manualOnly = Array.from(manuallyMarked).filter((id) => !idsFromServer.has(id))

    const manualCount = manualOnly.length
    const serverCount = unread_count?.message.reduce((sum, c) => sum + c.unread_count, 0) || 0

    return serverCount + manualCount
  }, [unread_count?.message, manuallyMarked])

  return {
    unread_count,
    updateCount,
    totalUnreadCount
  }
}

export default useUnreadMessageCount

export const useFetchUnreadMessageCount = () => {
  const [latestUnreadData, setLatestUnreadData] = useState<any | null>(null)
  const { currentUser } = useContext(UserContext)
  const { channels, dm_channels } = useChannelList()
  const { unread_count, updateCount } = useUnreadMessageCount()
  const { call } = useContext(FrappeContext) as FrappeConfig
  const manuallyMarked = useAtomValue(manuallyMarkedAtom)

  const fetchUnreadCountForChannel = async (channelID: string) => {
    const channelData =
      channels.find((c) => c.name === channelID && c.member_id) ||
      dm_channels.find((c) => c.name === channelID && c.member_id)

    if (!channelData) return

    updateCount(
      (d) => {
        if (d) {
          return call
            .get('raven.api.raven_message.get_unread_count_for_channel', {
              channel_id: channelID
            })
            .then((data: { message: any }) => {
              const info = data.message
              setLatestUnreadData(info)
              const newChannels = [...d.message]
              const index = newChannels.findIndex((c) => c.name === channelID)

              const updatedChannel: any = {
                name: info.name,
                unread_count: info.unread_count,
                channel_name: info.channel_name,
                is_direct_message: info.is_direct_message,
                peer_user_id: info.peer_user_id,
                last_message_details: info.last_message_details,
                last_message_timestamp: info.last_message_timestamp,
                last_message_sender_name: info.last_message_sender_name,
                last_message_content: info.last_message_content
              }

              if (index === -1) {
                newChannels.push(updatedChannel)
              } else {
                newChannels[index] = updatedChannel
              }

              return { message: newChannels }
            })
        } else return d
      },
      { revalidate: false }
    )
  }

  const { channelID } = useParams()
  const { updateLastMessageInChannelList } = useUpdateLastMessageInChannelList()

  const { call: trackVisit } = useFrappePostCall('raven.api.raven_channel_member.track_visit')

  const { play } = useNotificationAudio()

  useFrappeEventListener('raven:unread_channel_count_updated', async (event) => {
    if (event.sent_by !== currentUser) {
      const isCurrentChannel = channelID === event.channel_id

      // if (isCurrentChannel && !document.hidden) {
      //   // Chỉ trackVisit khi tab active
      //   trackVisit({ channel_id: channelID })
      // }

      const currentUnread = unread_count?.message.find((c) => c.name === event.channel_id)?.unread_count || 0
      const isManuallyMarked = manuallyMarked.has(event.channel_id)

      const shouldPlay = !isManuallyMarked || (isManuallyMarked && currentUnread > 1)

      setLatestUnreadData({
        name: event.channel_id,
        last_message_sender_name: event.last_message_sender_name,
        is_direct_message: event.is_direct_message,
        channel_name: event.channel_name,
        last_message_timestamp: event.last_message_timestamp
      })

      if (shouldPlay) {
        play(event.last_message_timestamp)
      }

      // 🚀 Luôn gọi fetch để cập nhật updatedChannel
      fetchUnreadCountForChannel(event.channel_id)
    } else {
      updateUnreadCountToZero(event.channel_id)
    }

    updateLastMessageInChannelList(event.channel_id, event.last_message_timestamp, event.last_message_details)
  })

  const updateUnreadCountToZero = (channel_id?: string) => {
    updateCount(
      (d) => {
        if (d) {
          const newChannels = d.message.map((c) => {
            if (c.name === channel_id) return { ...c, unread_count: 0 }
            return c
          })
          return { message: newChannels }
        } else return d
      },
      { revalidate: false }
    )
  }

  useEffect(() => {
    const app_name = window.app_name || 'Raven'
    let blinkInterval: NodeJS.Timeout
    let blinkState = false
    let activeTitle = app_name

    const allChannelMap = new Map((unread_count?.message || []).map((c) => [c.name, c]))
    const manualOnly = Array.from(manuallyMarked).filter((id) => !allChannelMap.has(id))
    const manualCount = manualOnly.length
    const serverUnreadCount = unread_count?.message.reduce((sum, c) => sum + c.unread_count, 0) || 0
    const totalUnread = serverUnreadCount + manualCount

    if (totalUnread === 0) {
      document.title = app_name
      return
    }

    const isManualOnly = totalUnread > 0 && serverUnreadCount === 0
    let hasRealNewMessage = false

    if (latestUnreadData) {
      const { name, last_message_sender_name, is_direct_message, channel_name, last_message_timestamp } =
        latestUnreadData
      const isManuallyMarked = manuallyMarked.has(name)
      const currentUnread = allChannelMap.get(name)?.unread_count || 0

      if (!isManuallyMarked || (isManuallyMarked && currentUnread > 1)) {
        hasRealNewMessage = true

        if (is_direct_message === 0) {
          activeTitle = `(${totalUnread}) ${last_message_sender_name} đã nhắn trong nhóm ${channel_name || name}`
        } else {
          activeTitle = `(${totalUnread}) ${last_message_sender_name} đã nhắn cho bạn`
        }
        play(last_message_timestamp)
      } else {
        activeTitle = `(${totalUnread}) Bạn có tin nhắn chưa đọc`
      }
    } else {
      activeTitle = `(${totalUnread}) Bạn có tin nhắn mới`
    }

    const startBlink = () => {
      clearInterval(blinkInterval)
      blinkInterval = setInterval(() => {
        document.title = blinkState ? '💬 Tin nhắn mới!' : activeTitle
        blinkState = !blinkState
      }, 1000)
    }

    const stopBlink = () => {
      clearInterval(blinkInterval)
      document.title = `(${totalUnread}) ${app_name}`
    }

    const handleVisibilityChange = () => {
      if (document.hidden && hasRealNewMessage) {
        startBlink()
      } else {
        stopBlink()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (document.hidden && hasRealNewMessage) {
      startBlink()
    } else {
      stopBlink()
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(blinkInterval)
      document.title = app_name
    }
  }, [unread_count, channels, latestUnreadData, manuallyMarked])

  return unread_count
}

export const useUpdateUnreadCountToZero = () => {
  const { updateCount } = useUnreadMessageCount()

  const updateUnreadCountToZero = (channel_id?: string) => {
    updateCount(
      (d) => {
        const currentList = d?.message ?? []
        const newList = currentList.map((c) => (c.name === channel_id ? { ...c, unread_count: 0 } : c))
        return { message: newList }
      },
      { revalidate: false }
    )
  }

  return updateUnreadCountToZero
}
