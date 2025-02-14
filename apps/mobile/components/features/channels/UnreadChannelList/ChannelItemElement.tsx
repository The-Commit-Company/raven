import { Pressable, View, StyleSheet } from "react-native"
import { Text } from "@components/nativewindui/Text"
import { router } from "expo-router"
import { ChannelIcon } from "../ChannelList/ChannelIcon"
import { useColorScheme } from "@hooks/useColorScheme"
import { ChannelWithUnreadCount } from "@raven/lib/hooks/useGetChannelUnreadCounts"

const ChannelItemElement = ({ channel }: { channel: ChannelWithUnreadCount }) => {
    const colors = useColorScheme()
    return (
        <Pressable
            // short press -> navigate
            onPress={() => router.push(`../chat/${channel.name}`)}
            // long press -> show context menu
            onLongPress={() => console.log(`channel long pressed - ${channel.name}`)}
            // Use tailwind classes for layout and ios:active state
            className='flex-row items-center px-3 py-2 rounded-lg ios:active:bg-linkColor'
            // Add a subtle ripple effect on Android
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <View className="flex-row items-center w-full justify-between">
                <View className="flex-row items-center">
                    <ChannelIcon type={channel.type} fill={colors.colors.icon} />
                    <Text className="ml-2 text-base font-medium">{channel.channel_name}</Text>
                </View>
                <Text style={styles.unreadCount} className="bg-card-background">{channel.unread_count}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    unreadCount: {
        borderRadius: 6,
        fontWeight: '700',
        fontSize: 12,
        paddingHorizontal: 10,
    }
})

export default ChannelItemElement

