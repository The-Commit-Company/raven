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
        <View className='flex-row gap-2 items-end'>
            <Text className='font-semibold'>{userFullName}</Text>
            <Text className='text-sm text-foreground/50'>{creation.split(' ')[0]}</Text>
        </View>
    )
}

export default MessageHeader