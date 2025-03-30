import React, { useCallback } from 'react'
import { View, Pressable } from 'react-native'
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'
import UserAvatar from '@components/layout/UserAvatar'
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import { RavenUser } from '@raven/types/Raven/RavenUser'
import { CombinedChannel } from './ForwardMessage'

interface ChannelRowProps {
    item: CombinedChannel
    handleChannelSelect: (channel: CombinedChannel) => void
    currentUserInfo: RavenUser | undefined
}

export const ChannelRow = React.memo(({ item, handleChannelSelect, currentUserInfo }: ChannelRowProps) => {
    const { colors } = useColorScheme()

    const isDMChannel = item.is_direct_message
    const user = item.user

    const handleCheckedChange = useCallback(() => {
        handleChannelSelect(item);
    }, [handleChannelSelect, item])

    if (isDMChannel && !user?.enabled) return null

    return (
        <Pressable
            className="px-3 py-2 flex flex-row items-center gap-3 rounded-md ios:active:bg-linkColor"
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
            onPress={handleCheckedChange}
            hitSlop={10}
        >
            {isDMChannel ? (
                <UserAvatar
                    src={user?.user_image ?? ""}
                    alt={user?.full_name ?? ""}
                    avatarProps={{ className: "w-8 h-8" }}
                    fallbackProps={{ className: "rounded-md" }}
                    imageProps={{ className: "rounded-md" }}
                />
            ) : (
                <View className="w-8 h-8 rounded-md bg-card justify-center items-center">
                    <ChannelIcon size={16} type={item?.type as string} fill={colors.icon} />
                </View>
            )}
            <Text className="text-base">
                {isDMChannel
                    ? `${user?.full_name}${currentUserInfo?.name === user?.name ? " (You)" : ""}`
                    : item.channel_name}
            </Text>
        </Pressable>
    )
}) 