import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem';
import { useMemo } from 'react';

export type UnreadChannelCountItem = { name: string, user_id?: string, unread_count: number, is_direct_message: 0 | 1 }
export type UnreadCountData = UnreadChannelCountItem[]

export interface UseGetChannelUnreadCountProps {
    channels: ChannelListItem[]
    dm_channels: DMChannelListItem[]
    unread_count: UnreadCountData | undefined
}

export interface ChannelWithUnreadCount extends ChannelListItem {
    unread_count: number
}

export interface DMChannelWithUnreadCount extends DMChannelListItem {
    unread_count: number
}

export const useGetChannelUnreadCounts = ({ channels, dm_channels, unread_count }: UseGetChannelUnreadCountProps) => {

    const { unreadChannels, readChannels, unreadDMs, readDMs } = useMemo(() => {

        const unreadCounts: Record<string, number> = {}

        // Create a mapping of channel names to unread counts
        unread_count?.forEach(item => {
            unreadCounts[item.name] = item.unread_count || 0
        })

        const unreadChannels: ChannelWithUnreadCount[] = []
        const readChannels: ChannelListItem[] = []
        const unreadDMs: DMChannelWithUnreadCount[] = []
        const readDMs: DMChannelListItem[] = []

        const allChannels: (ChannelListItem | DMChannelListItem)[] = [...channels, ...dm_channels]

        // Process all channels and DMs to separate unread and read
        allChannels.filter((channel) => !channel.is_archived).forEach(channel => {
            const unreadCount = unreadCounts[channel.name] || 0
            const channelWithUnread = { ...channel, unread_count: unreadCount }

            if (unreadCount > 0) {
                if ('is_direct_message' in channel && channel.is_direct_message) {
                    unreadDMs.push(channelWithUnread as DMChannelWithUnreadCount)
                } else {
                    unreadChannels.push(channelWithUnread as ChannelWithUnreadCount)
                }
            } else {
                if ('is_direct_message' in channel && channel.is_direct_message) {
                    readDMs.push(channelWithUnread as DMChannelWithUnreadCount)
                } else {
                    readChannels.push(channelWithUnread as ChannelWithUnreadCount)
                }
            }
        });

        return { unreadChannels, readChannels, unreadDMs, readDMs }

    }, [channels, dm_channels, unread_count])

    return { unreadChannels, readChannels, unreadDMs, readDMs }
}