// atoms/sortedChannelsAtom.ts
import { atom, useAtomValue } from 'jotai'
import { useUnreadMessages } from '../layout/sidebar'

export type ChannelWithGroupType = {
  name: string
  channel_name?: string
  last_message_timestamp?: string
  unread_count?: number
  group_type: 'channel' | 'dm'
  [key: string]: any
}

export const sortedChannelsAtom = atom<ChannelWithGroupType[]>([])

export const prepareSortedChannels = (
  channels: any[],
  dm_channels: any[]
): ChannelWithGroupType[] => {
  return [
    ...channels.map((channel) => ({ ...channel, group_type: 'channel' as const })),
    ...dm_channels.map((dm) => ({ ...dm, group_type: 'dm' as const }))
  ].sort((a, b) => {
    const timeA = new Date(a.last_message_timestamp || 0).getTime()
    const timeB = new Date(b.last_message_timestamp || 0).getTime()
    return timeB - timeA
  })
}

export const useEnrichedChannels = (): ChannelWithGroupType[] => {
  const channels = useAtomValue(sortedChannelsAtom)
  const { message: unreadList } = useUnreadMessages() || {}

  return channels.map((channel) => {
    const unread = unreadList?.find((u) => u.name === channel.name)

    return {
      ...channel,
      unread_count: unread?.unread_count ?? 0,
      last_message_content: unread?.last_message_content ?? channel.last_message_content,
      last_message_sender_name: unread?.last_message_sender_name ?? channel.last_message_sender_name
    }
  })
}

