import { useFrappeGetCall } from "frappe-react-sdk"
import { db, type UserData } from "../db/db"
import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { useLoadUsers } from "./useLoadUsers"

export type ChannelMemberData = UserData & { is_admin?: 1 | 0, channel_member_name?: string }

export const useChannelMembers = (channelID: string) => {
    const isReady = useLoadUsers()
    const { data: channelMembersData, isLoading: isChannelMembersLoading, error: channelMembersError, mutate } = useFrappeGetCall(
        'raven.api.raven_channel_member.get_channel_members',
        { channel_id: channelID },
        ["channel_members", channelID], {
        keepPreviousData: true,
        dedupingInterval: 1000 * 60 * 5, // Revalidate every 5 minutes
    })

    const channelMembers = channelMembersData?.message ?? {}

    const memberIds = useMemo(() => Object.keys(channelMembers), [channelMembers])

    const usersData = useLiveQuery<(UserData | undefined)[]>(
        () => memberIds.length > 0 ? db.users.bulkGet(memberIds) : Promise.resolve([]),
        [memberIds]
    )

    // if usersData is undefined, it means the query is still loading.
    const isUsersLoading = !isReady || memberIds.length > 0 && usersData === undefined;

    const members = useMemo<ChannelMemberData[]>(() => {
        if (memberIds.length === 0) return []
        if (!usersData || usersData.length === 0) return []

        return memberIds.map((id, index) => {
            const user = usersData[index]
            const channelData = channelMembers[id]

            if (!user) return null

            return {
                ...user,
                ...channelData
            } as ChannelMemberData
        }).filter((m): m is ChannelMemberData => m !== null)
        .sort((a, b) => {
            // Admins first
            const aIsAdmin = Boolean(a.is_admin);
            const bIsAdmin = Boolean(b.is_admin);

            if (aIsAdmin !== bIsAdmin) {
                return aIsAdmin ? -1 : 1;
            }

            // Then alphabetical by name
            const aName = a.full_name || a.name || '';
            const bName = b.full_name || b.name || '';
            return aName.localeCompare(bName);
        })
    }, [memberIds, usersData, channelMembers])

    return {
        members,
        memberIds,
        isLoading: isChannelMembersLoading || isUsersLoading,
        error: channelMembersError,
        mutate
    }
}