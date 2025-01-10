import { FileMessage, ImageMessage, PollMessage, TextMessage } from '@raven/types/common/Message'
import { View } from 'react-native'
import MessageAvatar from './MessageItemElements/MessageAvatar'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import MessageHeader from './MessageItemElements/MessageHeader'
import FileMessageRenderer from './MessageItemElements/FileMessageRenderer'

type Props = {
    message: FileMessage | PollMessage | TextMessage | ImageMessage
}

const MessageItem = ({ message }: Props) => {

    const username = message.bot || message.owner

    const user = useGetUser(username)

    const userFullName = user?.full_name || username

    return (
        <View className='flex-1 flex-row px-2 py-0.5 gap-1'>
            <MessageAvatar
                userFullName={userFullName}
                userImage={user?.user_image}
                isBot={!!message.bot}
                userID={message.owner}
                botID={message.bot}
                is_continuation={message.is_continuation}
            />
            <View>
                <MessageHeader
                    is_continuation={message.is_continuation}
                    userFullName={userFullName}
                    timestamp={message.formattedTime || ''}
                />
                {message.message_type === 'File' && <FileMessageRenderer message={message} />}
                {/* <Text>{message.text}</Text> */}
            </View>
        </View>
    )
}

export default MessageItem
