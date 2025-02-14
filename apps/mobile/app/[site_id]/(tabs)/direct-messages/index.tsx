import { Link } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import useGetDirectMessageChannels from '@raven/lib/hooks/useGetDirectMessageChannels';
import { DMChannelListItem } from '@raven/types/common/ChannelListItem';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import UserAvatar from '@components/layout/UserAvatar';
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';
import { useIsUserActive } from '@hooks/useIsUserActive';

export default function DirectMessages() {
    const { colors } = useColorScheme()

    const { dmChannels } = useGetDirectMessageChannels()

    return (
        <ScrollView style={{ backgroundColor: colors.background }} className='px-2.5 py-1'>
            {dmChannels.map((dm) => <DMRow key={dm.name} dm={dm} />)}
        </ScrollView>
    )
}

interface DMRowProps {
    dm: DMChannelListItem
}
const DMRow = ({ dm }: DMRowProps) => {
    const user = useGetUser(dm.peer_user_id)

    const isActive = useIsUserActive(dm.peer_user_id)

    return (
        <Link href={`../chat/${dm.name}`} asChild>
            <Pressable
                // Use tailwind classes for layout and ios:active state
                className='flex-row items-center gap-3 px-3 py-2 rounded-lg ios:active:bg-linkColor'
                // Add a subtle ripple effect on Android
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            >
                <UserAvatar src={user?.user_image} alt={user?.full_name ?? user?.name ?? ''} isActive={isActive} availabilityStatus={user?.availability_status} avatarProps={{ className: 'h-10 w-10' }} />

                <View className='flex-col'>
                    <Text className='text-base dark:text-gray-300'>{user?.full_name}</Text>
                    <Text className='text-sm text-gray-600 dark:text-gray-500 mt-0.5'>{dm.last_message_details ? JSON.parse(dm?.last_message_details)?.content?.substring(0, 35) + "..." : ""}</Text>
                </View>
            </Pressable>
        </Link>
    )
}