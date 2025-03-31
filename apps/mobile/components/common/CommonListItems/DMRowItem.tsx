import { Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { useGetUser } from '@raven/lib/hooks/useGetUser';
import UserAvatar from '@components/layout/UserAvatar';
import { DMChannelListItem } from '@raven/types/common/ChannelListItem';

interface DMRowItemProps {
    dmChannel: DMChannelListItem
    onPress: (dm: DMChannelListItem, user: ReturnType<typeof useGetUser>) => void
}

const DMRowItem = ({ dmChannel, onPress }: DMRowItemProps) => {

    const user = useGetUser(dmChannel.peer_user_id)

    return (
        <Pressable
            onPress={() => onPress?.(dmChannel, user)}
            className='flex-row items-center px-2 py-1.5 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <UserAvatar
                src={user?.user_image}
                alt={user?.full_name ?? user?.name ?? ''}
                avatarProps={{ className: 'h-8 w-8' }}
                textProps={{ className: 'text-sm' }}
                isBot={user?.type === 'Bot'}
            />
            <Text className='ml-2 text-base'>{user?.full_name}</Text>
        </Pressable>
    )
}

export default DMRowItem