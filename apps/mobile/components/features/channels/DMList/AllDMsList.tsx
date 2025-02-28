import { Divider } from "@components/layout/Divider"
import UserAvatar from "@components/layout/UserAvatar"
import { useIsUserActive } from "@hooks/useIsUserActive"
import useUnreadMessageCount from "@hooks/useUnreadMessageCount"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { DMChannelWithUnreadCount, useGetChannelUnreadCounts } from "@raven/lib/hooks/useGetChannelUnreadCounts"
import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { ChannelListContext, ChannelListContextType } from "@raven/lib/providers/ChannelListProvider"
import { DMChannelListItem } from "@raven/types/common/ChannelListItem"
import { Link } from "expo-router"
import { useContext, useMemo, memo } from "react"
import { Pressable, View, Text } from "react-native"

const AllDMsList = memo(({ workspace }: { workspace: string }) => {
    const { channels, dm_channels } = useContext(ChannelListContext) as ChannelListContextType
    const unread_count = useUnreadMessageCount()

    const workspaceChannels = useMemo(() => {
        return channels.filter((channel) => channel.workspace === workspace)
    }, [channels, workspace])

    const { unreadDMs, readDMs } = useGetChannelUnreadCounts({
        channels: workspaceChannels,
        dm_channels,
        unread_count: unread_count
    })

    return (
        <View className="flex flex-col">
            {unreadDMs.map((dm) => <UnreadDMRow key={dm.name} dm={dm} />)}
            {readDMs.map((dm) => <DMRow key={dm.name} dm={dm} />)}
        </View>
    )
})

interface DMRowBaseProps {
    dm: DMChannelListItem | DMChannelWithUnreadCount
    isUnread?: boolean
    unreadCount?: number
}

const DMRowBase = memo(({ dm, isUnread = false, unreadCount }: DMRowBaseProps) => {
    const { myProfile } = useCurrentRavenUser()
    const user = useGetUser(dm.peer_user_id)
    const isActive = useIsUserActive(dm.peer_user_id)

    // Parse JSON only once
    const lastMessageContent = useMemo(() => {
        if (!dm.last_message_details) return "Say hi 👋"
        try {
            return JSON.parse(dm.last_message_details)?.content?.trim() || "Say hi 👋"
        } catch {
            console.log(dm.last_message_details)
            return "Say hi 👋"
        }
    }, [dm.last_message_details])

    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <Pressable
                className='flex-row items-center gap-3 px-3 ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            >
                <UserAvatar
                    src={user?.user_image}
                    alt={user?.full_name ?? user?.name ?? ''}
                    isActive={isActive}
                    availabilityStatus={user?.availability_status}
                    avatarProps={{ className: 'h-10 w-10' }}
                />

                <View className='flex-col gap-2 pt-2'>
                    <View className='flex-row justify-between pr-14'>
                        <Text
                            className='text-base color-foreground'
                            style={{ fontWeight: isUnread ? 'bold' : 'normal' }}
                        >
                            {user?.full_name} {myProfile?.name === user?.name && '(You)'}
                        </Text>
                        {dm.last_message_timestamp && (
                            <LastMessageTimestamp
                                timestamp={dm.last_message_timestamp}
                                isUnread={isUnread}
                            />
                        )}
                    </View>

                    <View className='flex-row justify-between'>
                        <Text
                            className='text-sm color-muted-foreground line-clamp-1 pr-14'
                            style={{ fontWeight: isUnread ? 'bold' : 'normal' }}
                        >
                            {lastMessageContent}
                        </Text>

                        {unreadCount !== undefined && unreadCount > 0 && (
                            <Text
                                style={{
                                    borderRadius: 6,
                                    fontWeight: '700',
                                    fontSize: 12,
                                    paddingHorizontal: 10,
                                }}
                                className="bg-card-background"
                            >
                                {unreadCount}
                            </Text>
                        )}
                    </View>

                    <Divider prominent size={2} marginHorizontal={0} className="min-w-full" />
                </View>
            </Pressable>
        </Link>
    )
})

interface UnreadDMRowProps {
    dm: DMChannelWithUnreadCount
}

const UnreadDMRow = memo(({ dm }: UnreadDMRowProps) => {
    return <DMRowBase dm={dm} isUnread={true} unreadCount={dm.unread_count} />
})

interface DMRowProps {
    dm: DMChannelListItem
}

const DMRow = memo(({ dm }: DMRowProps) => {
    return <DMRowBase dm={dm} isUnread={false} />
})

interface LastMessageTimestampProps {
    timestamp: string
    isUnread?: boolean
}

const LastMessageTimestamp = memo(({ timestamp }: LastMessageTimestampProps) => {
    const displayTimestamp = useMemo(() => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 1000 * 60 * 60 * 24) {
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }

        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }, [timestamp])

    return (
        <Text
            className='text-sm color-muted-foreground'
        >
            {displayTimestamp}
        </Text>
    )
})

export default AllDMsList