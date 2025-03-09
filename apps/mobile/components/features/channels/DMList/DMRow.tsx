import UserAvatar from "@components/layout/UserAvatar"
import { useColorScheme } from "@hooks/useColorScheme"
import { useIsUserActive } from "@hooks/useIsUserActive"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { Link } from "expo-router"
import { useMemo } from "react"
import { Pressable, View, Text } from "react-native"
import Markdown from "react-native-marked"
import { MessagePreviewRenderer } from "./MessagePreviewRenderer"
import { DMChannelWithUnreadCount } from "@raven/lib/hooks/useGetChannelUnreadCounts"
import { DMChannelListItem } from "@raven/types/common/ChannelListItem"

interface DMRowProps {
    dm: DMChannelListItem | DMChannelWithUnreadCount
    isUnread?: boolean
}

const DMRow = ({ dm, isUnread = false }: DMRowProps) => {

    const { myProfile } = useCurrentRavenUser()
    const user = useGetUser(dm.peer_user_id)
    const isActive = useIsUserActive(dm.peer_user_id)

    const { colors } = useColorScheme()

    const lastMessageContent = useMemo(() => {
        if (dm.last_message_details) {
            try {
                const parsedDetails = JSON.parse(dm.last_message_details)
                return parsedDetails.content?.trim() || ''
            } catch (e) {
                console.error('Error parsing last_message_details:', e)
                return ''
            }
        }
        return ''
    }, [dm.last_message_details])

    const renderer = new MessagePreviewRenderer(isUnread, colors);

    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <View className='flex flex-row items-center'>
                <View
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: '100%',
                        backgroundColor: isUnread ? colors.primary : 'transparent',
                    }}
                />
                <Pressable
                    className='flex-row items-center gap-2 pt-2 pl-2 pr-4 pb-1 ios:active:bg-linkColor'
                    android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                    <UserAvatar
                        src={user?.user_image}
                        alt={user?.full_name ?? user?.name ?? ''}
                        isActive={isActive}
                        availabilityStatus={user?.availability_status}
                        avatarProps={{ className: 'h-10 w-10' }}
                    />
                    <View className='flex-1 flex-col overflow-hidden'>
                        <View className='flex flex-row justify-between items-center'>
                            <Text
                                className='text-base text-foreground'
                                style={{ fontWeight: isUnread ? 'bold' : 'normal' }}>
                                {user?.full_name} {myProfile?.name === user?.name && '(You)'}
                            </Text>
                            {dm.last_message_timestamp && (
                                <LastMessageTimestamp
                                    timestamp={dm.last_message_timestamp}
                                    isUnread={isUnread}
                                />
                            )}
                        </View>
                        <View style={{ maxHeight: 30, maxWidth: '100%', }}>
                            <Markdown
                                flatListProps={{
                                    scrollEnabled: false,
                                    initialNumToRender: 1,
                                    maxToRenderPerBatch: 1,
                                }}
                                value={lastMessageContent || ''}
                                renderer={renderer}
                            />
                        </View>
                    </View>
                </Pressable>
            </View>
        </Link>
    )

}

interface LastMessageTimestampProps {
    timestamp: string
    isUnread?: boolean
}

const LastMessageTimestamp = ({ timestamp }: LastMessageTimestampProps) => {
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
        <Text className='text-sm text-muted-foreground'>
            {displayTimestamp}
        </Text>
    )
}

export default DMRow