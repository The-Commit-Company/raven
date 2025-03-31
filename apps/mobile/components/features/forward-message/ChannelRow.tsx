import React, { useCallback } from 'react'
import { Pressable } from 'react-native'
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'
import UserAvatar from '@components/layout/UserAvatar'
import { ChannelIcon } from '@components/features/channels/ChannelList/ChannelIcon'
import { CombinedChannel } from './ForwardMessage'

interface ChannelRowProps {
    item: CombinedChannel
    handleChannelSelect: (channel: CombinedChannel) => void
}

export const ChannelRow = React.memo(({ item, handleChannelSelect }: ChannelRowProps) => {

    const { colors } = useColorScheme()

    const isDMChannel = item.is_direct_message
    const user = item.user

    const handleCheckedChange = useCallback(() => {
        handleChannelSelect(item)
    }, [handleChannelSelect, item])

    if (isDMChannel && !user?.enabled) return null

    if (isDMChannel) {
        return (
            <Pressable
                onPress={handleCheckedChange}
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

    return (
        <Pressable
            onPress={handleCheckedChange}
            className='flex flex-row gap-2 items-center px-2 py-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <ChannelIcon type={item.type as string} fill={colors.icon} />
            <Text className="text-base">{item.channel_name}</Text>
        </Pressable>
    )
})