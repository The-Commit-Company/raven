import { useState } from 'react';
import { View, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { router } from 'expo-router';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { ChannelListRow } from './ChannelListRow';
import HashIcon from '@assets/icons/HashIcon.svg';

interface ChannelListUIProps {
    channels: ChannelListItem[];
}

const ChannelListUI = ({ channels }: ChannelListUIProps) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const colors = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <View className="flex-row items-center gap-2">
                    <HashIcon fill={colors.colors.icon} height={18} width={18} />
                    <Text style={styles.headerText}>Channels</Text>
                </View>
                {isExpanded ? <ChevronDownIcon fill={colors.colors.icon} /> : <ChevronRightIcon fill={colors.colors.icon} />}
            </TouchableOpacity>
            {isExpanded && <>
                {channels.map((channel) => <ChannelListRow key={channel.name} channel={channel} />)}
                <Pressable style={styles.addChannelButton} className='ios:active:bg-linkColor'
                    onPress={() => router.push('../home/create-channel', { relativeToDirectory: true })}>
                    <PlusIcon fill={colors.colors.icon} height={18} width={18} />
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
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    addChannelText: {
        marginLeft: 12,
        fontSize: 16,
    },
})

export default ChannelListUI