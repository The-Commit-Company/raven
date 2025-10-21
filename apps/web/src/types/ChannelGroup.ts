import { ChannelListItem } from "@raven/types/common/ChannelListItem"

export interface ChannelGroup {
  id: string
  name: string
  channels: ChannelListItem[]
  order: number
  isCollapsed?: boolean
}

export interface ChannelSidebarData {
  groups: ChannelGroup[]
  ungroupedChannels: ChannelListItem[]
}
