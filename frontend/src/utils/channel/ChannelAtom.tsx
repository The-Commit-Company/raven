// atoms/sortedChannelsAtom.ts
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useUnreadCount } from '../layout/sidebar'
import { useMemo } from 'react'

export type ChannelWithGroupType = {
  name: string
  channel_name?: string
  last_message_timestamp?: string
  unread_count?: number
  group_type: 'channel' | 'dm'
  [key: string]: any
}

// Danh sách đầy đủ các channel (cả group và DM)
export const sortedChannelsAtom = atom<ChannelWithGroupType[]>([])

// Không cần doneListAtom vì đã có is_done

// Action để cập nhật sortedChannelsAtom một cách an toàn
export const setSortedChannelsAtom = atom(
  null,
  (get, set, next: ChannelWithGroupType[] | ((prev: ChannelWithGroupType[]) => ChannelWithGroupType[])) => {
    const prev = get(sortedChannelsAtom)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const resolved = typeof next === 'function' ? (next as Function)(prev) : next
    set(sortedChannelsAtom, resolved)
  }
)

// Hàm chuẩn bị dữ liệu ban đầu (channel + dm)
export const prepareSortedChannels = (channels: any[], dm_channels: any[]): ChannelWithGroupType[] => {
  return [
    ...channels.map((channel) => ({
      ...channel,
      group_type: 'channel' as const,
      is_done: channel.is_done ?? 0,
      user_labels: channel.user_labels ?? []
    })),
    ...dm_channels.map((dm) => ({
      ...dm,
      group_type: 'dm' as const,
      is_done: dm.is_done ?? 0,
      user_labels: dm.user_labels ?? []
    }))
  ].sort((a, b) => {
    const timeA = new Date(a.last_message_timestamp || 0).getTime()
    const timeB = new Date(b.last_message_timestamp || 0).getTime()
    return timeB - timeA
  })
}

// Hook để lấy danh sách channel chưa done
export const useEnrichedChannels = (): ChannelWithGroupType[] => {
  const channels = useAtomValue(sortedChannelsAtom)
  const unreadList = useUnreadCount().message || []

  const enriched = useMemo(() => {
    // Chỉ lọc theo is_done
    const filteredChannels = channels.filter((channel) => channel.is_done === 0)

    return filteredChannels.map((channel) => {
      const unread = unreadList.find((u) => u.name === channel.name)

      return {
        ...channel,
        unread_count: unread?.unread_count ?? channel.unread_count ?? 0,
        last_message_content: unread?.last_message_content ?? channel.last_message_content,
        last_message_sender_name: unread?.last_message_sender_name ?? channel.last_message_sender_name,
        user_labels: channel.user_labels ?? []
      }
    })
  }, [channels, unreadList])

  return enriched
}

export const useEnrichedLabelChannels = (): ChannelWithGroupType[] => {
  const channels = useAtomValue(sortedChannelsAtom)
  const unreadList = useUnreadCount().message || []

  const enriched = useMemo(() => {
    return channels.map((channel) => {
      const unread = unreadList.find((u) => u.name === channel.name)

      return {
        ...channel,
        unread_count: unread?.unread_count ?? channel.unread_count ?? 0,
        last_message_content: unread?.last_message_content ?? channel.last_message_content,
        last_message_sender_name: unread?.last_message_sender_name ?? channel.last_message_sender_name,
        user_labels: channel.user_labels ?? []
      }
    })
  }, [channels, unreadList])

  return enriched
}

// Hook update label
export const useUpdateChannelLabels = () => {
  const setSortedChannels = useSetAtom(sortedChannelsAtom)

  const updateChannelLabels = (channelID: string, updateFn: (prevLabels: string[]) => string[]) => {
    setSortedChannels((prev) =>
      prev.map((channel) =>
        channel.name === channelID
          ? {
              ...channel,
              user_labels: updateFn(Array.isArray(channel.user_labels) ? channel.user_labels : [])
            }
          : channel
      )
    )
  }

  const addLabelToChannel = (channelID: string, newLabelID: string) => {
    updateChannelLabels(channelID, (prev) => [...new Set([...prev, newLabelID])])
  }

  const removeLabelFromChannel = (channelID: string, labelID: string) => {
    updateChannelLabels(channelID, (prev) => prev.filter((id) => id !== labelID))
  }

  return {
    updateChannelLabels,
    addLabelToChannel,
    removeLabelFromChannel
  }
}
