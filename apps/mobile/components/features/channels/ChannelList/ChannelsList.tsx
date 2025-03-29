import { Divider } from '@components/layout/Divider';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { useMemo, useState } from 'react';
import { View, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { router } from 'expo-router';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { ChannelListRow } from './ChannelListRow';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';

const ChannelsList = ({ channels }: { channels: ChannelListItem[] }) => {

    const { myProfile } = useCurrentRavenUser()
    const pinnedChannelIDs = myProfile?.pinned_channels?.map(pin => pin.channel_id)

    const filteredChannels = useMemo(() => {
        return channels.filter(channel => !pinnedChannelIDs?.includes(channel.name))
    }, [channels, pinnedChannelIDs])

    return <>
        <ChannelListUI channels={filteredChannels} />
        <Divider prominent />
    </>
}

export const ChannelListUI = ({ channels }: { channels: ChannelListItem[] }) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const { colors } = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <Text style={styles.headerText}>Channels</Text>
                <View className="flex-row items-center gap-1">
                    <Pressable
                        hitSlop={10}
                        className='active:bg-card-background px-1.5 py-1 rounded-lg'
                        onPress={() => router.push('../home/create-channel', { relativeToDirectory: true })}>
                        <PlusIcon fill={colors.icon} height={20} width={20} />
                    </Pressable>
                    {isExpanded ? <ChevronDownIcon fill={colors.icon} /> : <ChevronRightIcon fill={colors.icon} />}
                </View>
            </TouchableOpacity>
            {isExpanded && <>
                {channels.map((channel) => <ChannelListRow key={channel.name} channel={channel} />)}
                <Pressable style={styles.addChannelButton} className='ios:active:bg-linkColor'
                    onPress={() => router.push('../home/create-channel', { relativeToDirectory: true })}>
                    <PlusIcon fill={colors.icon} height={18} width={18} />
                    <Text style={styles.addChannelText}>Add channel</Text>
                </Pressable>
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
    },
    channelText: {
        marginLeft: 12,
        fontSize: 16,
    },
    addChannelButton: {
        flexDirection: 'row',
        gap: 0,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    addChannelText: {
        marginLeft: 12,
        fontSize: 16,
    },
})

export default ChannelsList
