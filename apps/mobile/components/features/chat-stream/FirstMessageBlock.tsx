import { View } from "react-native"
import { Text } from "@components/nativewindui/Text"
import { useCurrentChannelData } from "@hooks/useCurrentChannelData"
import { ChannelListItem, DMChannelListItem } from "@raven/types/common/ChannelListItem"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useGetUser } from "@raven/lib/hooks/useGetUser"
import { useMemo } from "react"
import { useIsUserActive } from "@hooks/useIsUserActive"
import { replaceCurrentUserFromDMChannelName } from "@raven/lib/utils/operations"
import UserAvatar from "@components/layout/UserAvatar"

const ChannelHistoryFirstMessage = ({ channelID }: { channelID: string }) => {

    const { channel } = useCurrentChannelData(channelID)

    if (channel) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channel.type === "dm") {
            return <FirstMessageBlockForDM channelData={channel.channelData} />
        }
        else {
            return <FirstMessageBlockForChannel channelData={channel.channelData} />
        }
    }

    return null
}

const FirstMessageBlockForDM = ({ channelData }: { channelData: DMChannelListItem }) => {

    const { myProfile: currentUserInfo } = useCurrentRavenUser()
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

    const userName = fullName ?? peer ?? replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUserInfo?.name ?? '')

    return (
        <View className="p-3">
            {channelData?.is_direct_message == 1 && (
                <View className="flex flex-col gap-3">
                    <View className="flex flex-row gap-3 items-center">
                        <UserAvatar
                            src={userImage}
                            alt={userName}
                            isActive={isActive}
                            isBot={isBot}
                            availabilityStatus={peerData?.availability_status}
                        />
                        <View className="flex flex-col gap-0">
                            <Text className="font-semibold">{userName}</Text>
                            <Text>
                                {isBot ? <View className="bg-linkColor rounded-md px-2 py-0.5 opacity-70 dark:opacity-80">
                                    <Text className="text-xs font-medium">Bot</Text>
                                </View> : <Text className='text-sm text-muted-foreground'>{peer}</Text>}
                            </Text>
                        </View>
                    </View>
                    {channelData?.is_self_message == 1 ? (
                        <Text className='text-sm'><Text className='text-sm font-semibold'>This space is all yours.</Text> Draft messages, list your to-dos, or keep links and files handy.</Text>
                    ) : (
                        <View className="flex flex-row gap-2 items-center">
                            {peer || fullName ? (
                                <Text className='text-sm'>This is a Direct Message channel between you and <Text className='text-sm font-semibold'>{fullName ?? peer}</Text>.</Text>
                            ) : (
                                <Text className='text-sm'>We could not find the user for this DM channel ({replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUserInfo?.name ?? "")}).</Text>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

const FirstMessageBlockForChannel = ({ channelData }: { channelData: ChannelListItem }) => {
    return (
        <View>
            <Text>FirstMessageBlockForChannel</Text>
        </View>
    )
}

export default ChannelHistoryFirstMessage