import UserAvatar from '@components/layout/UserAvatar'
import { useIsUserActive } from '@hooks/useIsUserActive'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { replaceCurrentUserFromDMChannelName } from '@raven/lib/utils/operations'
import { DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { useMemo } from 'react'
import { View, Text } from 'react-native'

const DMChannelHeader = ({ channelData }: { channelData: DMChannelListItem }) => {

    const { myProfile: currentUserInfo } = useCurrentRavenUser()
    const { channelMembers } = useFetchChannelMembers(channelData.name)

    // There are two people in a DM channel, the user (you) and the peer (the other person)
    // If channelData.is_self_message is 1, then the user is having a conversation with themself

    const peer = channelData.peer_user_id
    const isActive = useIsUserActive(channelData.peer_user_id)

    const { isBot, fullName, userImage } = useMemo(() => {
        const peerUserData = channelMembers?.[peer]
        const isBot = peerUserData?.type === 'Bot'
        return {
            fullName: peerUserData?.full_name ?? peer,
            userImage: peerUserData?.user_image ?? '',
            isBot
        }
    }, [channelMembers, peer, currentUserInfo])

    const userName = fullName ?? peer ?? replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUserInfo?.name ?? '')
    const user = useGetUser(peer)

    return (
        <View className='flex-1 flex-row items-center gap-2.5'>
            <UserAvatar
                src={userImage}
                alt={userName}
                isActive={isActive}
                isBot={isBot}
                availabilityStatus={user?.availability_status}
                avatarProps={{ className: "w-6 h-6" }}
                fallbackProps={{ className: "rounded-[4px]" }}
                textProps={{ className: "text-xs font-medium" }}
                imageProps={{ className: "rounded-[4px]" }}
            />
            <Text className='text-base font-semibold text-foreground'>{userName}</Text>
        </View>
    )
}

export default DMChannelHeader