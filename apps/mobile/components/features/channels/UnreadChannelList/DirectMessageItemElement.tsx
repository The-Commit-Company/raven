import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { router } from 'expo-router';
import UserAvatar from "@components/layout/UserAvatar";
import { DMChannelWithUnreadCount } from "@raven/lib/hooks/useGetChannelUnreadCounts";
import { useFrappePrefetchCall } from "frappe-react-sdk";
import UnreadCountBadge from "@components/common/Badge/UnreadCountBadge";

const DirectMessageItemElement = ({ dm }: { dm: DMChannelWithUnreadCount }) => {
    const user = useGetUser(dm.peer_user_id)

    const prefetchChannel = useFrappePrefetchCall('raven.api.chat_stream.get_messages', {
        channel_id: dm.name,
        limit: 20
    }, { path: `get_messages_for_channel_${dm.name}` })

    const handlePress = () => {
        prefetchChannel()
        router.push(`../chat/${dm.name}`)
    }
    return (
        <Pressable
            onPress={handlePress}
            // Use tailwind classes for layout and ios:active state
            className='flex-row items-center px-3 py-1.5 rounded-lg ios:active:bg-linkColor'
            // Add a subtle ripple effect on Android
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
        >
            <View className="flex-row items-center w-full justify-between">
                <View className="flex-row items-center">
                    <UserAvatar src={user?.user_image} alt={user?.full_name ?? user?.name ?? ''} avatarProps={{ className: 'h-8 w-8' }} />
                    <Text style={styles.dmChannelText}>{user?.full_name}</Text>
                </View>
                {dm.unread_count > 0 ? <UnreadCountBadge count={dm.unread_count} /> : null}
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    headerText: {
        fontWeight: '600',
        fontSize: 16,
    },
    dmChannelText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    }
})

export default DirectMessageItemElement