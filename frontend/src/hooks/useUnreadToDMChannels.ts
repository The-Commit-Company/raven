interface UnreadItem {
  name: string
  is_direct_message: number
  unread_count: number
}

interface DMChannelListItem {
  name: string
  is_direct_message: number
  // ...các trường khác
}

interface DMChannelWithUnreadCount extends DMChannelListItem {
  unread_count: number
}

export function mapUnreadToDMChannels(
  dm_channels: DMChannelListItem[],
  unread: UnreadItem[]
): DMChannelWithUnreadCount[] {
  const unreadMap: Record<string, number> = {}

  unread.forEach((item) => {
    unreadMap[item.name] = item.unread_count || 0
  })

  return dm_channels.map((channel) => ({
    ...channel,
    unread_count: unreadMap[channel.name] || 0
  }))
}
