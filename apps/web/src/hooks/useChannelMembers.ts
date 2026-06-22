import { useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { UserData } from "@db"
import { channelMembersStore, type MemberMeta } from "@stores/members/store"
import { useUsersById } from "@hooks/useMessageRowLookups"

export type ChannelMemberData = UserData & { is_admin?: 0 | 1; channel_member_name?: string | null }

type Caller = FrappeConfig["call"]

/**
 * Fetch + seed a channel's (or thread's) members into the store. Idempotent: a no-op
 * unless the entry is idle or `force` (used by realtime / add-remove to refresh).
 */
export const loadChannelMembers = (call: Caller, channelID: string, force = false) => {
    if (!channelID) return
    if (!force && channelMembersStore.getEntry(channelID).status !== "idle") return
    channelMembersStore.setStatus(channelID, "loading")
    call
        .get<{ message: Record<string, MemberMeta> }>("raven.api.raven_channel_member.get_channel_members", {
            channel_id: channelID,
        })
        .then((res) => channelMembersStore.setMembers(channelID, res.message ?? {}))
        .catch(() => channelMembersStore.setStatus(channelID, "error"))
}

/** Refetch a channel's members ONLY if it's already loaded — for `channel_members_updated`. */
export const refetchChannelMembersIfLoaded = (call: Caller, channelID: string) => {
    if (channelMembersStore.isLoaded(channelID)) loadChannelMembers(call, channelID, true)
}

/** Seed members directly without a fetch — e.g. from get_thread_details (same shape). */
export const seedChannelMembers = (channelID: string, members: Record<string, MemberMeta>) => {
    channelMembersStore.setMembers(channelID, members)
}

/**
 * A channel's (or thread's) members, store-backed. Triggers the lazy fetch on mount,
 * resolves member ids → UserData via usersStore, and returns the same shape the old
 * SWR hook did so consumers are unchanged. `mutate` forces a refetch.
 */
export const useChannelMembers = (channelID: string, options?: { autoFetch?: boolean }) => {
    // autoFetch=false: read the store but don't trigger get_channel_members — for callers
    // that seed it another way (the thread pill seeds from get_thread_details).
    const autoFetch = options?.autoFetch ?? true
    const { call } = useContext(FrappeContext) as FrappeConfig
    const entry = useSyncExternalStore(
        useCallback((onChange) => channelMembersStore.subscribe(channelID, onChange), [channelID]),
        () => channelMembersStore.getEntry(channelID),
    )
    const usersById = useUsersById()

    useEffect(() => {
        if (autoFetch) loadChannelMembers(call, channelID)
    }, [call, channelID, autoFetch])

    const memberIds = useMemo(() => Object.keys(entry.members), [entry.members])

    const members = useMemo<ChannelMemberData[]>(() => {
        return memberIds
            .map((id) => {
                const user = usersById.get(id)
                if (!user) return null
                const meta = entry.members[id]
                return { ...user, is_admin: meta?.is_admin, channel_member_name: meta?.channel_member_name } as ChannelMemberData
            })
            .filter((m): m is ChannelMemberData => m !== null)
            .sort((a, b) => {
                const aIsAdmin = Boolean(a.is_admin)
                const bIsAdmin = Boolean(b.is_admin)
                if (aIsAdmin !== bIsAdmin) return aIsAdmin ? -1 : 1
                return (a.full_name || a.name || "").localeCompare(b.full_name || b.name || "")
            })
    }, [memberIds, entry.members, usersById])

    return {
        members,
        memberIds,
        isLoading: entry.status === "idle" || entry.status === "loading",
        error: entry.status === "error",
        mutate: () => loadChannelMembers(call, channelID, true),
    }
}
