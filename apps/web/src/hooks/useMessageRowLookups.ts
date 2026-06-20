import { useMemo, useSyncExternalStore } from 'react'
import { useChannelList } from "@stores/channels/useChannelList"
import { useWorkspaces, WorkspaceFields } from '@hooks/useWorkspaces'
import { usersStore } from '@stores/usersStore'
import { UserData } from '@db'
import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem'

/**
 * O(1) lookup Maps for message-row virtualization. Use these in place of
 * per-row `useUser` / `useChannel` SWR subscriptions inside virtualized lists
 * (search results, notifications, threads, saved, etc.).
 *
 * Each sub-hook returns a stable Map keyed by `.name`. Compose via
 * `useMessageRowLookups()` when you need all four.
 */

/** All consumers share usersStore's single snapshot — see that file for why. */
export const useUsersById = (): Map<string, UserData> =>
    useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot)

export const useChannelsById = (): Map<string, ChannelListItem> => {
    const { channels } = useChannelList()
    return useMemo(() => {
        const m = new Map<string, ChannelListItem>()
        for (const c of channels) m.set(c.name, c)
        return m
    }, [channels])
}

export const useDMsById = (): Map<string, DMChannelListItem> => {
    const { dmChannels } = useChannelList()
    return useMemo(() => {
        const m = new Map<string, DMChannelListItem>()
        for (const c of dmChannels) m.set(c.name, c)
        return m
    }, [dmChannels])
}

export const useWorkspacesById = (): Map<string, WorkspaceFields> => {
    const { workspaces } = useWorkspaces()
    return useMemo(() => {
        const m = new Map<string, WorkspaceFields>()
        for (const w of workspaces) m.set(w.name, w)
        return m
    }, [workspaces])
}

/**
 * Composed lookup hook. Pre-builds user / channel / dm-channel / workspace
 * Maps once per parent render so virtualized rows can resolve refs with
 * O(1) `Map.get()` instead of firing async SWR hooks per row.
 *
 * Without this, each visible row triggers useUser + useChannel + useUser(peer)
 * — 3 SWR subscriptions that each re-render the row when they resolve,
 * producing 30-50 mounts/updates while scrolling.
 */
export const useMessageRowLookups = () => ({
    usersById: useUsersById(),
    channelById: useChannelsById(),
    dmById: useDMsById(),
    workspaceById: useWorkspacesById(),
})
