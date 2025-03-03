import { Divider } from "@components/layout/Divider"
import UserAvatar from "@components/layout/UserAvatar"
import { SearchInput } from "@components/nativewindui/SearchInput"
import { useColorScheme } from "@hooks/useColorScheme"
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

    const { colors } = useColorScheme()

    return (
        <View className="flex flex-col">
            <View className="flex-1">
                <View className="p-3">
                    <SearchInput style={{ backgroundColor: colors.grey5 }}
                        placeholder="Search"
                        placeholderTextColor={colors.grey} />
                </View>
            </View>
            {unreadDMs.map((dm) => <UnreadDMRow key={dm.name} dm={dm} />)}
            {readDMs.filter((dm) => dm.last_message_details).map((dm) => <DMRow key={dm.name} dm={dm} />)}
        </View>
    )
})

interface DMRowBaseProps {
    dm: DMChannelListItem | DMChannelWithUnreadCount
    isUnread?: boolean
}

const DMRowBase = memo(({ dm, isUnread = false }: DMRowBaseProps) => {
    const { myProfile } = useCurrentRavenUser()
    const user = useGetUser(dm.peer_user_id)
    const isActive = useIsUserActive(dm.peer_user_id)

    const lastMessageContent = useMemo(() => {
        if (!dm.last_message_details) return "Say hi 👋"
        try {
            return JSON.parse(dm.last_message_details)?.content?.trim() || "Say hi 👋"
        } catch {
            console.log(dm.last_message_details)
            return "Say hi 👋"
        }
    }, [dm.last_message_details])

    const { colors } = useColorScheme()

    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <Pressable
                className='flex-row items-center gap-2 ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            >
                <View
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: '100%',
                        backgroundColor: isUnread ? colors.primary : 'transparent',
                    }}
                />
                <UserAvatar
                    src={user?.user_image}
                    alt={user?.full_name ?? user?.name ?? ''}
                    isActive={isActive}
                    availabilityStatus={user?.availability_status}
                    avatarProps={{ className: 'h-10 w-10' }}
                />

                <View className='flex-col gap-2 pt-2 pl-1  flex-1'>
                    <View className='flex-row justify-between pr-3'>
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

                    <View className='flex-row justify-between pr-2'>
                        <Text
                            className='text-sm color-muted-foreground line-clamp-1'
                            style={{ fontWeight: isUnread ? 'bold' : 'normal' }}
                        >
                            {lastMessageContent}
                        </Text>
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
    return <DMRowBase dm={dm} isUnread={true} />
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

        else if (diff < 1000 * 60 * 60 * 24 * 7) {
            return date.toLocaleDateString([], { weekday: 'long' })
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