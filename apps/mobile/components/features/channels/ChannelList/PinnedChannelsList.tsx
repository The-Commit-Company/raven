import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import useGetChannels from "@raven/lib/hooks/useGetChannels"
import { useMemo, useState } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useColorScheme } from "@hooks/useColorScheme"
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { ChannelListRow } from "./ChannelListRow"
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg'
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg'
import { Text } from '@components/nativewindui/Text';
import { Divider } from "@components/layout/Divider"

const PinnedChannelsList = ({ workspace }: { workspace: string }) => {

    const { channels } = useGetChannels({ showArchived: false })
    const { myProfile } = useCurrentRavenUser()

    const pinnedChannels = useMemo(() => {
        if (myProfile) {
            const pinnedChannelIDs = myProfile.pinned_channels?.map(pin => pin.channel_id)

            return channels.filter(channel => pinnedChannelIDs?.includes(channel.name) && channel.is_archived === 0 && channel.workspace === workspace)
                .map(channel => {
                    // const count = unread_count?.channels.find((unread) => unread.name === channel.name)?.unread_count || 0
                    return {
                        ...channel,
                        // unread_count: count
                    }
                })
                .filter(channel => channel.workspace === workspace)
            // .filter(channel => channel.unread_count === 0)  // Exclude channels with unread messages
        } else {
            return []
        }
    }, [channels, myProfile, workspace])

    if (pinnedChannels.length === 0) {
        return null
    }

    return (
        <>
            <PinnedChannelListUI channels={pinnedChannels} />
            <Divider />
        </>
    )
}

export default PinnedChannelsList

const PinnedChannelListUI = ({ channels }: { channels: ChannelListItem[] }) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const colors = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <Text style={styles.headerText}>Favorites</Text>
                {isExpanded ? <ChevronDownIcon fill={colors.colors.icon} /> : <ChevronRightIcon fill={colors.colors.icon} />}
            </TouchableOpacity>
            {isExpanded && <>
                {channels.map((channel) => <ChannelListRow key={channel.name} channel={channel} />)}
            </>}
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