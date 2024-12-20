import React, { useState } from 'react';
import { View, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { ChannelIcon } from './ChannelIcon';
import { Text } from '@components/nativewindui/Text';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import PlusIcon from '@assets/icons/PlusIcon.svg';
import { ChannelListItem } from '@raven/types/common/ChannelListItem';
import { Link } from 'expo-router';

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
                <Text style={styles.headerText}>Channels</Text>
                {isExpanded ? <ChevronDownIcon fill={colors.colors.icon} /> : <ChevronRightIcon fill={colors.colors.icon} />}
            </TouchableOpacity>
            {isExpanded && <>
                {channels.map((channel) => <ChannelListRow key={channel.name} channel={channel} />)}
                <Pressable style={styles.addChannelButton}
                    onPress={() => console.log('Create channel pressed')}>
                    <PlusIcon fill={colors.colors.icon} height={18} width={18} />
                    <Text style={styles.addChannelText}>Add channel</Text>
                </Pressable>
            </>}
        </View>
    )
}

const ChannelListRow = ({ channel }: { channel: ChannelListItem }) => {
    const colors = useColorScheme()
    return (
        <Link href={`../chat/${channel.name}`} asChild>
            <Pressable
                onPress={() => console.log(`channel selected - ${channel.name}`)}
                onLongPress={() => console.log(`channel long pressed - ${channel.name}`)}
                // Use tailwind classes for layout and ios:active state
                className="flex-row items-center px-3 py-2 rounded-lg ios:active:bg-gray-200"
                // Add a subtle ripple effect on Android
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            >
                <ChannelIcon type={channel.type} fill={colors.colors.icon} />
                <Text className="ml-2 text-base">{channel.channel_name}</Text>
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