// atoms/sortedChannelsAtom.ts
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useUnreadMessages } from '../layout/sidebar'

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

// Danh sách các channel đã mark done (tên)
export const doneListAtom = atom<string[]>([])

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
    ...channels.map((channel) => ({ ...channel, group_type: 'channel' as const })),
    ...dm_channels.map((dm) => ({ ...dm, group_type: 'dm' as const }))
  ].sort((a, b) => {
    const timeA = new Date(a.last_message_timestamp || 0).getTime()
    const timeB = new Date(b.last_message_timestamp || 0).getTime()
    return timeB - timeA
  })
}

// Hook để lấy danh sách channel đã loại bỏ những cái đã "done"
export const useEnrichedChannels = (): ChannelWithGroupType[] => {
  const channels = useAtomValue(sortedChannelsAtom)
  const doneList = useAtomValue(doneListAtom)
  const { message: unreadList } = useUnreadMessages() || {}

  const filteredChannels = channels.filter((channel) => !doneList.includes(channel.name))

  return filteredChannels.map((channel) => {
    const unread = unreadList?.find((u) => u.name === channel.name)

    return {
      ...channel,
      unread_count: unread?.unread_count ?? channel.unread_count ?? 0,
      last_message_content: unread?.last_message_content ?? channel.last_message_content,
      last_message_sender_name: unread?.last_message_sender_name ?? channel.last_message_sender_name,
      user_labels: channel.user_labels ?? [] // đảm bảo không bị mất user_labels
    }
  })
}

export const useUpdateChannelLabels = () => {
  const setChannels = useSetAtom(setSortedChannelsAtom)

  const updateChannelLabels = (channelID: string, updateFn: (prevLabels: string[]) => string[]) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.name === channelID
          ? {
              ...c,
              user_labels: updateFn(Array.isArray(c.user_labels) ? c.user_labels : [])
            }
          : c
      )
    )
  }

  const setSortedChannels = useSetAtom(sortedChannelsAtom)

  const addLabelToChannel = (channelID: string, newLabelID: string) => {
    setSortedChannels((prev) =>
      prev.map((channel) =>
        channel.name === channelID
          ? {
              ...channel,
              user_labels: Array.isArray(channel.user_labels)
                ? [...new Set([...channel.user_labels, newLabelID])]
                : [newLabelID]
            }
          : channel
      )
    )
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
