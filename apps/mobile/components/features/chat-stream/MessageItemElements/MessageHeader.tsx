import { Text } from '@components/nativewindui/Text'
import React from 'react'
import { View } from 'react-native'

type Props = {
    is_continuation: 0 | 1,
    userFullName: string,
    creation: string,
}

const MessageHeader = ({ is_continuation, userFullName, creation }: Props) => {

    if (is_continuation) return null
    return (
        <View className='flex-row gap-2 items-baseline'>
            <Text className='font-medium text-base'>{userFullName}</Text>
            <Text className='text-xs text-foreground/50'>{creation.split(' ')[0]}</Text>
        </View>
    )
}

export default MessageHeader