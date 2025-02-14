import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { Link } from 'expo-router';
import UserAvatar from "@components/layout/UserAvatar";
import { DMChannelWithUnreadCount } from "@raven/lib/hooks/useGetChannelUnreadCounts";

const DirectMessageItemElement = ({ dm }: { dm: DMChannelWithUnreadCount }) => {
    const user = useGetUser(dm.peer_user_id)
    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <Pressable
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
                    <Text style={styles.unreadCount} className="bg-card-background">{dm.unread_count}</Text>
                </View>
            </Pressable>
        </Link>
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
    },
    unreadCount: {
        borderRadius: 6,
        fontWeight: '700',
        fontSize: 12,
        paddingHorizontal: 10,
    }
})

export default DirectMessageItemElement