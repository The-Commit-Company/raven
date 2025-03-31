import { DMChannelListItem } from '@raven/types/common/ChannelListItem';
import { useState } from 'react';
import { View, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import ChevronDownIcon from '@assets/icons/ChevronDownIcon.svg';
import ChevronRightIcon from '@assets/icons/ChevronRightIcon.svg';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import UserAvatar from '@components/layout/UserAvatar';
import { Link } from 'expo-router';
import { useIsUserActive } from '@hooks/useIsUserActive';

const DMList = ({ dms }: { dms: DMChannelListItem[] }) => {
    return <DMListUI dms={dms} />
}

const DMListUI = ({ dms }: { dms: DMChannelListItem[] }) => {

    const [isExpanded, setIsExpanded] = useState(true)
    const { colors } = useColorScheme()

    const toggleAccordion = () => {
        setIsExpanded((prev) => !prev)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.header} activeOpacity={0.7}>
                <Text style={styles.headerText}>Direct Messages</Text>
                {isExpanded ? <ChevronDownIcon fill={colors.icon} /> : <ChevronRightIcon fill={colors.icon} />}
            </TouchableOpacity>
            {isExpanded && <>
                {dms.map((dm) => <DMListRow key={dm.name} dm={dm} />)}
            </>}
        </View>
    )
}

export const DMListRow = ({ dm }: { dm: DMChannelListItem }) => {
    const user = useGetUser(dm.peer_user_id)

    const isActive = useIsUserActive(dm.peer_user_id)

    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <Pressable
                // Use tailwind classes for layout and ios:active state
                className='flex-row items-center px-3 py-1.5 rounded-lg ios:active:bg-linkColor'
                // Add a subtle ripple effect on Android
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            >
                <UserAvatar
                    src={user?.user_image ?? ""}
                    alt={user?.full_name ?? ""}
                    isActive={isActive}
                    availabilityStatus={user?.availability_status}
                    avatarProps={{ className: "w-8 h-8" }}
                    textProps={{ className: "text-sm font-medium" }}
                    isBot={user?.type === 'Bot'} />
                <Text style={styles.dmChannelText}>{user?.full_name}</Text>
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
    },
})

export default DMList