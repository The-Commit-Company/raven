import { useCallback, useMemo, useSyncExternalStore } from "react"
import { useChannelList } from "@stores/channels/useChannelList"
import { channelUnreadStore, type ChannelUnreadState } from "./store"

/**
 * Subscribes a component to one channel's unread state. Reads only — every write
 * goes through the store's inputs (reconcile / increment / markRead). Reference
 * is stable, so a row only re-renders when its own count or watermark changes.
 */
export const useChannelUnread = (channelID: string): ChannelUnreadState =>
    useSyncExternalStore(
        useCallback((onChange) => channelUnreadStore.subscribe(channelID, onChange), [channelID]),
        () => channelUnreadStore.getState(channelID),
    )

/** Number of channels with unread across the app (conversation count) — e.g. the tab title. */
export const useTotalUnread = (): number =>
    useSyncExternalStore(
        (onChange) => channelUnreadStore.subscribeGlobal(onChange),
        () => channelUnreadStore.getTotalUnread(),
    )

/**
 * Number of channels in the set that have unread — a conversation count, not a
 * message sum. Aggregate badges (workspace, DM, collapsed group) answer "how many
 * conversations need attention", so one noisy channel can't inflate them; the
 * per-channel rows still show message counts via useChannelUnread.
 */
export const useGroupUnread = (channelIDs: string[]): number =>
    useSyncExternalStore(
        useCallback((onChange) => channelUnreadStore.subscribeGlobal(onChange), []),
        () => channelIDs.reduce((total, id) => total + (channelUnreadStore.getState(id).count > 0 ? 1 : 0), 0),
    )

/**
 * Number of channels with unread in a workspace (conversation count). DMs are
 * excluded — they're workspace-agnostic and surfaced under their own entry.
 */
export const useWorkspaceUnread = (workspaceID: string): number => {
    const { channels } = useChannelList()
    const channelIDs = useMemo(
        () => channels.filter((channel) => channel.workspace === workspaceID).map((channel) => channel.name),
        [channels, workspaceID],
    )
    return useGroupUnread(channelIDs)
}

/** Number of DM channels with unread (conversation count) — for the Direct Messages entry. */
export const useDMUnread = (): number => {
    const { dmChannels } = useChannelList()
    const channelIDs = useMemo(() => dmChannels.map((channel) => channel.name), [dmChannels])
    return useGroupUnread(channelIDs)
}
