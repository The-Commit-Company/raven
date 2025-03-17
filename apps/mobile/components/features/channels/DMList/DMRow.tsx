import UserAvatar from "@components/layout/UserAvatar"
import { useColorScheme } from "@hooks/useColorScheme"
import { useIsUserActive } from "@hooks/useIsUserActive"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { Link } from "expo-router"
import { useMemo } from "react"
import { Pressable, View } from "react-native"
import { Text } from "@components/nativewindui/Text"
import Markdown from "react-native-marked"
import { MessagePreviewRenderer } from "./MessagePreviewRenderer"
import { DMChannelWithUnreadCount } from "@raven/lib/hooks/useGetChannelUnreadCounts"
import dayjs from "dayjs"

const DMRow = ({ dm }: { dm: DMChannelWithUnreadCount }) => {

    const { myProfile } = useCurrentRavenUser()
    const user = useGetUser(dm.peer_user_id)
    const isActive = useIsUserActive(dm.peer_user_id)

    const { colors } = useColorScheme()

    const { lastMessageContent, isSentByUser } = useMemo(() => {
        let isSentByUser = false
        let lastMessageContent = ''
        if (dm.last_message_details) {
            try {
                const parsedDetails = JSON.parse(dm.last_message_details)
                isSentByUser = parsedDetails.owner === myProfile?.name
                lastMessageContent = parsedDetails.content?.trim() || ''
            } catch (e) {
                console.error('Error parsing last_message_details:', e)
            }
        }
        return { lastMessageContent, isSentByUser }
    }, [dm.last_message_details])

    const isUnread = dm.unread_count > 0

    const renderer = new MessagePreviewRenderer(isUnread, colors)

    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <Pressable
                className='flex flex-row relative items-center gap-3 py-2.5 px-4 ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                {({ pressed, hovered }) => <>
                    <View
                        style={{
                            width: 6,
                            height: 6,
                            position: 'absolute',
                            left: 6,
                            top: 27,
                            borderRadius: '100%',
                            backgroundColor: isUnread ? colors.primary : 'transparent',
                        }}
                    />
                    <UserAvatar
                        src={user?.user_image}
                        alt={user?.full_name ?? user?.name ?? ''}
                        isActive={isActive}
                        isBot={user?.type === 'Bot'}
                        availabilityStatus={user?.availability_status}
                        avatarProps={{ className: 'h-10 w-10' }}
                    />
                    <View className='flex-1 flex-col overflow-hidden'>
                        <View className='flex flex-row justify-between items-center'>
                            <Text
                                className='text-base text-foreground'
                                style={{ fontWeight: isUnread ? '600' : '400' }}>
                                {user?.full_name} {myProfile?.name === user?.name && '(You)'}
                            </Text>
                            {dm.last_message_timestamp && (
                                <LastMessageTimestamp
                                    timestamp={dm.last_message_timestamp}
                                    isUnread={isUnread}
                                />
                            )}
                        </View>
                        <View className='flex flex-row items-center gap-1 justify-between'>
                            <View
                                style={{ maxHeight: 30, maxWidth: dm.unread_count > 0 ? '90%' : '100%', }}
                                className='flex flex-row items-center gap-1'>
                                {isSentByUser ? <Text className='text-xs text-muted-foreground'>You:</Text> : null}
                                <Markdown
                                    flatListProps={{
                                        scrollEnabled: false,
                                        initialNumToRender: 1,
                                        maxToRenderPerBatch: 1,
                                        contentContainerStyle: {
                                            backgroundColor: hovered || pressed ? colors.linkColor : 'transparent',
                                        }
                                    }}
                                    value={lastMessageContent || ''}
                                    renderer={renderer}
                                />
                            </View>
                            {(dm.unread_count && dm.unread_count > 0) ?
                                <View className='px-1.5 py-0.5 rounded-md bg-primary/20 dark:bg-primary'>
                                    <Text className='text-xs text-primary dark:text-white font-semibold'>{dm.unread_count}</Text>
                                </View>
                                : null
                            }
                        </View>
                    </View>
                </>}
            </Pressable>
        </Link>
    )

}

interface LastMessageTimestampProps {
    timestamp: string
    isUnread?: boolean
}

const LastMessageTimestamp = ({ timestamp }: LastMessageTimestampProps) => {
    const displayTimestamp = useMemo(() => {

        const dateObj = dayjs(timestamp)

        const today = dayjs()
        const yesterday = today.subtract(1, 'day')

        if (dateObj.isSame(today, 'day')) {
            return dateObj.fromNow()
        }

        if (dateObj.isSame(yesterday, 'day')) {
            return 'Yesterday'
        }

        if (dateObj.isSame(today, 'week')) {
            return dateObj.format('ddd')
        }

        if (dateObj.isSame(today, 'year')) {
            return dateObj.format('D MMM')
        }

        return dateObj.format('D MMM YYYY')
    }, [timestamp])

    return (
        <Text className='text-xs text-muted-foreground'>
            {displayTimestamp}
        </Text>
    )
}

export default DMRow