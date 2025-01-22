import { Divider } from "@components/layout/Divider"
import { Text } from '@components/nativewindui/Text'
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg'
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg'
import { ChannelListItem } from "@raven/types/common/ChannelListItem"
import { useColorScheme } from "@hooks/useColorScheme"
import { ChannelListRow } from "./ChannelListRow"
import useGetChannels from "@raven/lib/hooks/useGetChannels"

const UnreadChannelsList = ({ workspace }: { workspace: string }) => {
    const { channels } = useGetChannels({ showArchived: false })
    return (
        <>
            <UnreadChannelListUI channels={channels} />
            <Divider />
        </>
    )
}

const UnreadChannelListUI = ({ channels }: { channels: ChannelListItem[] }) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const colors = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <Text style={styles.headerText}>Unread</Text>
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

export default UnreadChannelsList