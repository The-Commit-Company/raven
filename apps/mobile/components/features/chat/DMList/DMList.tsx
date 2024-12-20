import React, { useState } from 'react';
import { View, Pressable, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { Avatar, AvatarFallback } from '@components/nativewindui/Avatar';
import { useColorScheme } from '@hooks/useColorScheme';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { cn } from '@lib/cn';
import { ChannelListItem } from '../ChannelList/ChannelList';

export interface DMChannelListItem extends ChannelListItem {
    peer_user_id: string,
    is_direct_message: 1,
}

export interface DMChannelWithUnreadCount extends DMChannelListItem {
    unread_count: number
}

interface DMListProps {
    dms: DMChannelWithUnreadCount[];
    onDMSelect: (userId: string) => void;
}

const DMList = ({ dms, onDMSelect }: DMListProps) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const colors = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <Text style={styles.headerText}>Direct Messages</Text>
                {isExpanded ? <ChevronDownIcon fill={colors.colors.icon} /> : <ChevronRightIcon fill={colors.colors.icon} />}
            </TouchableOpacity>
            {isExpanded && <>
                {dms.map((dm) => (
                    <Pressable
                        key={dm.name}
                        onPress={() => onDMSelect(dm.name)}
                        style={styles.dmChannelRow}
                    >
                        <Avatar alt={dm.channel_name} className="h-8 w-8">
                            <AvatarFallback>
                                <Text
                                    className={cn(
                                        'dark:text-background font-medium text-white',
                                        Platform.OS === 'ios' && 'dark:text-foreground'
                                    )}>
                                    {dm.channel_name.charAt(0) + dm.channel_name.charAt(1)}
                                </Text>
                            </AvatarFallback>
                        </Avatar>
                        <Text style={styles.dmChannelText}>{dm.channel_name}</Text>
                    </Pressable>
                ))}
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
    dmChannelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    dmChannelText: {
        marginLeft: 12,
        fontSize: 16,
    },
})

export default DMList;
