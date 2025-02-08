import { ChannelListItem, DMChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider';
import { useMemo } from 'react';

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
        unread_count?.channels?.forEach(item => {
            unreadCounts[item.name] = item.unread_count || 0
        })

        const unreadChannels: ChannelWithUnreadCount[] = []
        const readChannels: ChannelWithUnreadCount[] = []
        const unreadDMs: DMChannelWithUnreadCount[] = []
        const readDMs: DMChannelWithUnreadCount[] = []

        const allChannels: (ChannelListItem | DMChannelListItem)[] = [...channels, ...dm_channels]

        // Process all channels and DMs to separate unread and read
        allChannels.filter((channel) => {
            if (channel.is_archived) {
                return false
            }
            if (channel.type === "Public" && !channel.member_id) {
                return false
            }
            return true
        }).forEach(channel => {
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