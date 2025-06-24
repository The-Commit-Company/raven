// atoms/sortedChannelsAtom.ts
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { useUnreadCount } from '../layout/sidebar'
import { channelIsDoneAtom } from './channelIsDoneAtom'

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

export const sortedChannelsLoadingAtom = atom<boolean>(false)

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

export const setSortedChannelsLoadingAtom = atom(null, (get, set, next: boolean) => {
  set(sortedChannelsLoadingAtom, next)
})

export const prepareSortedChannels = (
  channels: any[],
  dm_channels: any[],
  currentChannelIsDone: Record<string, number> = {}
): ChannelWithGroupType[] => {
  return [
    ...(channels ?? []).map((channel) => ({
      ...channel,
      group_type: 'channel' as const,
      is_done: Object.prototype.hasOwnProperty.call(currentChannelIsDone, channel.name)
        ? currentChannelIsDone[channel.name]
        : typeof channel.is_done === 'number'
          ? channel.is_done
          : 0,
      user_labels: channel.user_labels ?? []
    })),
    ...(dm_channels ?? []).map((dm) => ({
      ...dm,
      group_type: 'dm' as const,
      is_done: Object.prototype.hasOwnProperty.call(currentChannelIsDone, dm.name)
        ? currentChannelIsDone[dm.name]
        : typeof dm.is_done === 'number'
          ? dm.is_done
          : 0,
      user_labels: dm.user_labels ?? []
    }))
  ].sort((a, b) => {
    const getTimestamp = (item: any) => {
      const lastMsg = item.last_message_timestamp ? new Date(item.last_message_timestamp).getTime() : 0
      const creation = item.creation ? new Date(item.creation).getTime() : 0
      return lastMsg > 0 ? lastMsg : creation
    }

    const timeA = getTimestamp(a)
    const timeB = getTimestamp(b)

    return timeB - timeA
  })
}

// Hook để lấy danh sách channel chưa done
export const useEnrichedSortedChannels = (filter?: 0 | 1 | string) => {
  const channels = useAtomValue(sortedChannelsAtom)
  const channelIsDone = useAtomValue(channelIsDoneAtom)
  const unreadList = useUnreadCount().message || []

  const enriched = useMemo(() => {
    return channels
      ?.map((channel) => {
        const resolvedIsDone = Object.prototype.hasOwnProperty.call(channelIsDone, channel.name)
          ? channelIsDone[channel.name]
          : channel.is_done

        const unread = unreadList.find((u) => u.name === channel.name)

        return {
          ...channel,
          is_done: resolvedIsDone,
          unread_count: unread?.unread_count ?? channel.unread_count ?? 0,
          last_message_content: unread?.last_message_content ?? channel.last_message_content,
          last_message_sender_name: unread?.last_message_sender_name ?? channel.last_message_sender_name,
          user_labels: channel.user_labels ?? []
        }
      })
      .filter((channel) => {
        // Nếu filter là string → đang lọc theo labelID
        if (typeof filter === 'string') {
          return Array.isArray(channel.user_labels) && channel.user_labels.includes(filter)
        }

        // Nếu filter là 0 hoặc 1 → lọc theo is_done
        if (filter === 0) return channel.is_done === 0
        if (filter === 1) return channel.is_done === 1

        return true
      })
  }, [channels, channelIsDone, unreadList, filter])

  return enriched
}

export const useEnrichedLabelChannels = (): ChannelWithGroupType[] => {
  const channels = useAtomValue(sortedChannelsAtom)
  const unreadList = useUnreadCount().message || []

  const enriched = useMemo(() => {
    return channels?.map((channel) => {
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

  const updateChannelLabels = (
    channelID: string,
    updateFn: (prevLabels: { label_id: string; label: string }[]) => { label_id: string; label: string }[]
  ) => {
    setSortedChannels((prev) =>
      prev?.map((channel) =>
        channel.name === channelID
          ? {
              ...channel,
              user_labels: updateFn(Array.isArray(channel.user_labels) ? channel.user_labels : [])
            }
          : channel
      )
    )
  }

  const addLabelToChannel = (channelID: string, newLabel: { label_id: string; label: string }) => {
    updateChannelLabels(channelID, (prev) => {
      // Nếu đã có rồi thì không thêm
      if (prev.some((l) => l.label_id === newLabel.label_id)) {
        return prev
      }
      // Thêm vào đầu mảng
      return [...prev, newLabel]
    })
  }

  const removeLabelFromChannel = (channelID: string, labelID: string) => {
    updateChannelLabels(channelID, (prev) => prev.filter((l) => l.label_id !== labelID))
  }

  const renameLabel = (oldLabelID: string, newLabel: string) => {
    setSortedChannels((prev) =>
      prev?.map((channel) => {
        if (!Array.isArray(channel.user_labels)) return channel
        const updatedLabels = channel.user_labels.map((l) =>
          l.label_id === oldLabelID ? { ...l, label: newLabel } : l
        )
        return {
          ...channel,
          user_labels: updatedLabels
        }
      })
    )
  }

  return {
    updateChannelLabels,
    addLabelToChannel,
    removeLabelFromChannel,
    renameLabel
  }
}
