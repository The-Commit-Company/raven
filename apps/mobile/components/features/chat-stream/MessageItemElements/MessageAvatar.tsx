import UserAvatar from '@components/layout/UserAvatar'
import { View } from 'react-native'

type Props = {
    userID: string,
    botID?: string,
    is_continuation: 0 | 1,
    userFullName: string,
    userImage?: string,
    isBot: boolean,
}

const MessageAvatar = ({ userID, botID, is_continuation, userFullName, userImage, isBot }: Props) => {

    if (is_continuation) {
        return <View className='w-12' />
    }

    return (
        <View className='w-12 mt-1.5'>
            <UserAvatar
                alt={userFullName}
                isBot={isBot}
                src={userImage}
            />
        </View>
    )
}

export default MessageAvatar