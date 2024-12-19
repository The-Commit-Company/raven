import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { ChannelListItem } from '../../../../types/channels';
import { ChannelIcon } from './ChannelIcon';
import { Text } from '@components/nativewindui/Text';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import PlusIcon from '@assets/icons/PlusIcon.svg';

interface ChannelListProps {
    channels: ChannelListItem[];
    onChannelSelect: (channelId: string) => void;
    onLongPress: (channelId: string) => void;
}

const ChannelList = ({ channels, onChannelSelect, onLongPress }: ChannelListProps) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const colors = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <Text style={styles.headerText}>Channels</Text>
                {isExpanded ? <ChevronDownIcon fill={colors.colors.icon} /> : <ChevronRightIcon fill={colors.colors.icon} />}
            </TouchableOpacity>
            {isExpanded && <>
                {channels.map((channel) => (
                    <Pressable
                        key={channel.name}
                        onPress={() => onChannelSelect(channel.name)}
                        onLongPress={() => onLongPress(channel.name)}
                        style={styles.channelRow}
                    >
                        <ChannelIcon type={channel.type} fill={colors.colors.icon} />
                        <Text style={styles.channelText}>{channel.channel_name}</Text>
                    </Pressable>
                ))}
                <Pressable style={styles.addChannelButton}
                    onPress={() => console.log('Create channel pressed')}>
                    <PlusIcon fill={colors.colors.icon} height={18} width={18} />
                    <Text style={styles.addChannelText}>Add Channel</Text>
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
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    channelText: {
        marginLeft: 12,
        fontSize: 16,
    },
    addChannelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    addChannelText: {
        marginLeft: 12,
        fontSize: 16,
    },
})

export default ChannelList
