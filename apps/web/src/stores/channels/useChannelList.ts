import { useSyncExternalStore, useCallback } from "react"
import type { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { channelStore } from "./store"

/**
 * The channel list, read from the store. Re-renders when the list changes (add /
 * remove / rename / archive / DM-preview). Arrays are reference-stable between
 * changes, so downstream `useMemo`s over them stay valid.
 */
export const useChannelList = () => {
    const channels = useSyncExternalStore(channelStore.subscribe, channelStore.getChannels)
    const dmChannels = useSyncExternalStore(channelStore.subscribe, channelStore.getDMChannels)
    const isLoading = !useSyncExternalStore(channelStore.subscribe, channelStore.isLoaded)
    return { channels, dmChannels, isLoading }
}

/**
 * A single channel by id, read from the store. Subscribes to ONLY that channel, so a
 * change to one channel (e.g. its DM-preview tick) re-renders just its watchers.
 */
export const useChannelById = (channelID: string): ChannelListItem | undefined => {
    const subscribe = useCallback(
        (listener: () => void) => channelStore.subscribeChannel(channelID, listener),
        [channelID],
    )
    const getSnapshot = useCallback(() => channelStore.getChannel(channelID), [channelID])
    return useSyncExternalStore(subscribe, getSnapshot)
}
