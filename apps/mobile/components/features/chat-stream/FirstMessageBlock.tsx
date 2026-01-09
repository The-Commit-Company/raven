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
import { ChannelIcon } from "../channels/ChannelList/ChannelIcon"
import { useColorScheme } from "@hooks/useColorScheme"
import { useFrappeGetDoc } from "frappe-react-sdk"
import { BaseMessageItem } from "./BaseMessageItem"
import { formatDate } from "@raven/lib/utils/dateConversions"
import { useTranslation } from 'react-i18next'

const ChannelHistoryFirstMessage = ({ channelID, isThread }: { channelID: string, isThread: boolean }) => {


    if (isThread) {
        return <ThreadHeader threadID={channelID} />
    } else {
        return <ChannelHeader channelID={channelID} />
    }

}

const ChannelHeader = ({ channelID }: { channelID: string }) => {
    const { t } = useTranslation()
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

    return <View className="pt-8 p-3">
        <Text>{t('channels.channelBeginning')}</Text>
    </View>
}


const ThreadHeader = ({ threadID }: { threadID: string }) => {
    const { t } = useTranslation()
    const { data } = useFrappeGetDoc("Raven Message", threadID)

    const threadMessage = useMemo(() => {
        if (data) {
            return {
                ...data,
                formattedTime: formatDate(data.creation)
            }
        }
    }, [data])

    return <View className="bg-card-background/30 py-2 rounded-lg">
        <View className='flex-1 flex-row items-center gap-2 pr-3 ml-3 py-2 border-b border-border/50'>
            <Text className='text-base font-semibold text-foreground'>{t('threads.startOfThread')}</Text>
        </View>
        <View className="pb-2">
            {threadMessage && <BaseMessageItem message={threadMessage} />}
        </View>
    </View>
}


const FirstMessageBlockForDM = ({ channelData }: { channelData: DMChannelListItem }) => {
    const { t } = useTranslation()
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
        <View className="pt-6 p-3">
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
                                    <Text className="text-xs font-medium">{t('common.bot')}</Text>
                                </View> : <Text className='text-sm text-muted-foreground'>{peer}</Text>}
                            </Text>
                        </View>
                    </View>
                    {channelData?.is_self_message == 1 ? (
                        <Text className='text-[15px]'>{t('messages.dmIntroSelf')}</Text>
                    ) : (
                        <View className="flex flex-row gap-2 items-center">
                            {peer || fullName ? (
                                <Text className='text-[15px]'>{t('messages.dmIntro')} <Text className='text-[15px] font-semibold'>{fullName ?? peer}</Text>.</Text>
                            ) : (
                                <Text className='text-[15px]'>{t('messages.dmUserNotFound')} ({replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUserInfo?.name ?? "")}).</Text>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

const FirstMessageBlockForChannel = ({ channelData }: { channelData: ChannelListItem }) => {
    const { t } = useTranslation()
    const { colors } = useColorScheme()
    return (
        <View className="pt-6 p-3">
            <View className="flex flex-col gap-2">
                <View className="flex flex-row items-center gap-1">
                    <ChannelIcon size={20} type={channelData?.type} fill={colors.foreground} />
                    <Text className="text-lg font-semibold">{channelData?.channel_name}</Text>
                </View>
                <Text className="text-[15px]">{t('channels.channelIntro')} <Text className="text-base font-semibold">{channelData?.channel_name}</Text> {t('channels.channelIntroEnd')}</Text>
                {channelData?.channel_description && <Text className="text-sm text-muted-foreground">{t('channels.channelDescriptionLabel')} {channelData?.channel_description}</Text>}
            </View>
        </View>
    )
}

export default ChannelHistoryFirstMessage