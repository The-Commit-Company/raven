import { TouchableOpacity, View } from 'react-native'
import { useCurrentChannelData } from '@raven/lib/hooks/useCurrentChannelData'
import { ChannelListItem, DMChannelListItem } from '@raven/types/common/ChannelListItem'
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import { useGetUserRecords } from '@raven/lib/hooks/useGetUserRecords'
import { useMemo } from 'react'
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser'
import { useFetchChannelMembers } from '@raven/lib/hooks/useFetchChannelMembers'
import UserAvatar from '../UserAvatar'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import { useIsUserActive } from '@hooks/useIsUserActive'
import { replaceCurrentUserFromDMChannelName } from '@raven/lib/utils/operations'
import { Text } from '@components/nativewindui/Text'
import { Badge } from '@components/nativewindui/Badge'
import { router } from 'expo-router'
import { useColorScheme } from '@hooks/useColorScheme'

interface EmptyStateForChannelProps {
    channelData: ChannelListItem,
}

const EmptyStateForChannel = ({ channelData }: EmptyStateForChannelProps) => {

    const { colors } = useColorScheme()

    const { channelMembers } = useFetchChannelMembers(channelData?.name)

    const { myProfile: currentUser } = useCurrentRavenUser()
    const users = useGetUserRecords()

    const { isAdmin } = useMemo(() => {
        const channelMember = channelMembers[currentUser?.name ?? ""]
        return {
            isAdmin: channelMember?.is_admin == 1
        }
    }, [channelMembers, currentUser])

    const navigateTo = (name: "edit-description" | "add-members") => {
        if (name === "add-members") {
            router.push("./add-new-channel-members", { relativeToDirectory: true })
        }

        if (name === "edit-description") {
            router.push("./channel-description-edit", { relativeToDirectory: true })
        }
    }

    return (
        <View className="flex flex-col p-2 gap-2">
            <View className="flex flex-col gap-2">
                <View className="flex flex-row items-center gap-2">
                    <ChannelIcon type={channelData?.type} />
                    <Text className='font-semibold'>{channelData?.channel_name}</Text>
                </View>
                <Text className='text-sm'>
                    {users[channelData?.owner]?.full_name} created this channel on DateYear Component. This is the very beginning of the <Text className='text-sm font-semibold'>{channelData?.channel_name}</Text> channel.
                </Text>
                {channelData?.channel_description && <Text>{channelData?.channel_description}</Text>}
            </View>
            {channelData?.is_archived == 0 && isAdmin && (
                <View className="flex flex-row gap-4">
                    <TouchableOpacity activeOpacity={0.6} onPress={() => navigateTo("edit-description")}>
                        <Text className='text-sm font-semibold' style={{ color: colors.primary }}>Add description</Text>
                    </TouchableOpacity>

                    {channelData?.is_archived == 0 && isAdmin && (
                        <TouchableOpacity activeOpacity={0.6} onPress={() => navigateTo("add-members")}>
                            <Text className='text-sm font-semibold' style={{ color: colors.primary }}>Add Members</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    )
}

interface EmptyStateForDMProps {
    channelData: DMChannelListItem
}

const EmptyStateForDM = ({ channelData }: EmptyStateForDMProps) => {
    const { myProfile: currentUser } = useCurrentRavenUser()

    const peer = channelData.peer_user_id

    const peerData = useGetUser(peer)

    const { fullName, userImage, isBot } = useMemo(() => {
        const isBot = peerData?.type === 'Bot'
        return {
            fullName: peerData?.full_name ?? peer,
            userImage: peerData?.user_image ?? '',
            isBot
        }
    }, [peerData, peer])

    const isActive = useIsUserActive(peer)

    const userName = fullName ?? peer ?? replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUser?.name ?? "")

    return (
        <View className="p-2">
            {channelData?.is_direct_message == 1 && (
                <View className="flex flex-col gap-3">
                    <View className="flex flex-row gap-3 items-center">
                        <UserAvatar alt={userName} src={userImage} isBot={isBot} availabilityStatus={peerData?.availability_status} isActive={isActive} />
                        <View className="flex flex-col gap-0">
                            <Text className='font-semibold'>{userName}</Text>
                            <Text>
                                {isBot ? <Badge>Bot</Badge> : <Text className='text-sm color-gray-600'>{peer}</Text>}
                            </Text>
                        </View>
                    </View>
                    {channelData?.is_self_message == 1 ? (
                        <View className="flex flex-col gap-1">
                            <Text className='text-sm'><Text className='text-sm font-semibold'>This space is all yours.</Text> Draft messages, list your to-dos, or keep links and files handy.</Text>
                            <Text className='text-sm'>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</Text>
                        </View>
                    ) : (
                        <View className="flex flex-row gap-2 items-center">
                            {peer || fullName ? (
                                <Text className='text-sm'>This is a Direct Message channel between you and <Text className='text-sm font-bold'>{fullName ?? peer}</Text>.</Text>
                            ) : (
                                <Text className='text-sm'>We could not find the user for this DM channel ({replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUser?.name ?? "")}).</Text>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

interface ChannelHistoryFirstMessageProps {
    channelID: string
}

export const ChannelHistoryFirstMessage = ({ channelID }: ChannelHistoryFirstMessageProps) => {

    const { channel } = useCurrentChannelData(channelID)

    if (channel) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channel.type === "dm") {
            return <EmptyStateForDM channelData={channel.channelData} />
        }
        else {
            return <EmptyStateForChannel channelData={channel.channelData} />
        }
    }

    return null
}

export default ChannelHistoryFirstMessage