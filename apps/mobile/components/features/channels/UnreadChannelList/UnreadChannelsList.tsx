import { Text } from '@components/nativewindui/Text'
import { useMemo, useState } from "react"
import { ChannelWithUnreadCount, DMChannelWithUnreadCount } from "@raven/lib/hooks/useGetChannelUnreadCounts"
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg'
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg'
import { useColorScheme } from "@hooks/useColorScheme"
import { Divider } from "@components/layout/Divider"
import DirectMessageItemElement from './DirectMessageItemElement'
import ChannelItemElement from './ChannelItemElement'
import UnreadChannelListMoreActions from './UnreadChannelListMoreActions'
import UnreadCountBadge from '@components/common/Badge/UnreadCountBadge'

interface UnreadChannelsListProps {
    unreadChannels: ChannelWithUnreadCount[]
    unreadDMs: DMChannelWithUnreadCount[]
}

const UnreadChannelsList = ({ unreadChannels, unreadDMs }: UnreadChannelsListProps) => {

    const { totalUnreadCount, channelIDs } = useMemo(() => {
        let totalUnreadCount = 0
        let channelIDs = []

        // Count unread messages from channels
        for (const channel of unreadChannels) {
            if (channel.is_archived == 0) {
                totalUnreadCount += channel.unread_count || 0
                channelIDs.push(channel.name)
            }
        }

        // Count unread messages from DMs
        for (const dm of unreadDMs) {
            totalUnreadCount += dm.unread_count || 0
            channelIDs.push(dm.name)
        }

        return { totalUnreadCount, channelIDs }
    }, [unreadChannels, unreadDMs])

    if (totalUnreadCount === 0) {
        return null
    }

    return (
        <>
            <UnreadChannelListUI
                totalUnreadCount={totalUnreadCount}
                unreadDMs={unreadDMs}
                unreadChannels={unreadChannels}
                channelIDs={channelIDs} />
            <Divider prominent />
        </>
    )
}

const UnreadChannelListUI = ({ totalUnreadCount, unreadDMs, unreadChannels, channelIDs }: { totalUnreadCount: number, unreadDMs: DMChannelWithUnreadCount[], unreadChannels: ChannelWithUnreadCount[], channelIDs: string[] }) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const { colors } = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <View className="flex-row items-center gap-2">
                    <Text style={styles.headerText}>Unread</Text>
                    {!isExpanded ? <UnreadCountBadge count={totalUnreadCount} /> : null}
                </View>
                <View className="flex-row items-center gap-1">
                    <UnreadChannelListMoreActions channelIDs={channelIDs} />
                    {isExpanded ? <ChevronDownIcon fill={colors.icon} /> : <ChevronRightIcon fill={colors.icon} />}
                </View>
            </TouchableOpacity>
            {isExpanded && <View className="flex gap-0.5 flex-col fade-in">
                {/* Render unread DMs */}
                {unreadDMs.map(dm => (
                    <DirectMessageItemElement
                        key={dm.name}
                        dm={dm}
                    />
                ))}
                {/* Render unread channels */}
                {unreadChannels.map(channel => (
                    <ChannelItemElement
                        key={channel.name}
                        channel={channel}
                    />
                ))}
            </View>}
        </View>
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
    }
})

export default UnreadChannelsList