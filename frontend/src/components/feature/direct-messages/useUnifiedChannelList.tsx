import { showOnlyMyChannelsAtom } from '@/components/layout/Sidebar/SidebarBody'
import type { ChannelListItem, DMChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

export type UnifiedChannel = (ChannelListItem | DMChannelListItem) & {
  unread_count: number
}

interface UseUnifiedChannelListProps {
  channels: ChannelListItem[]
  dm_channels: DMChannelListItem[]
  unread_count: UnreadCountData | undefined
}

export const useUnifiedChannelList = ({
  channels,
  dm_channels,
  unread_count
}: UseUnifiedChannelListProps): UnifiedChannel[] => {
  const showOnlyMyChannels = useAtomValue(showOnlyMyChannelsAtom)

  return useMemo(() => {
    const unreadMap: Record<string, number> = {}
    unread_count?.forEach((item) => {
      unreadMap[item.name] = item.unread_count || 0
    })

    const unifiedChannels: UnifiedChannel[] = []

    const allChannels = [...channels, ...dm_channels]

    allChannels?.forEach((channel) => {
      if (channel.is_archived) return

      // Skip public channels with no membership when filtered
      if (channel.type === 'Public' && !channel.member_id && showOnlyMyChannels) return

      unifiedChannels.push({
        ...channel,
        unread_count: unreadMap[channel.name] || 0
      })
    })

    // Sort theo last message (mới nhất lên trên)
    unifiedChannels.sort((a, b) => {
      const timeA = new Date((a as any).last_message_timestamp || a.creation || 0).getTime()
      const timeB = new Date((b as any).last_message_timestamp || b.creation || 0).getTime()
      return timeB - timeA
    })

    return unifiedChannels
  }, [channels, dm_channels, unread_count, showOnlyMyChannels])
}
