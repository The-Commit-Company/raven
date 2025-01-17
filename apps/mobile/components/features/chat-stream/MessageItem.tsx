import { FileMessage, ImageMessage, PollMessage, TextMessage } from '@raven/types/common/Message'
import { View } from 'react-native'
import MessageAvatar from './MessageItemElements/MessageAvatar'
import { useGetUser } from '@raven/lib/hooks/useGetUser'
import MessageHeader from './MessageItemElements/MessageHeader'
import FileMessageRenderer from './MessageItemElements/FileMessageRenderer'
import MessageTextRenderer from './MessageItemElements/MessageTextRenderer'
import clsx from 'clsx'

type Props = {
    message: FileMessage | PollMessage | TextMessage | ImageMessage
}

const MessageItem = ({ message }: Props) => {

    const username = message.bot || message.owner

    const user = useGetUser(username)

    const userFullName = user?.full_name || username

    return (
        <View className={clsx('flex-1 flex-row px-2 gap-1', message.is_continuation ? 'pt-0' : 'pt-4')}>
            <MessageAvatar
                userFullName={userFullName}
                userImage={user?.user_image}
                isBot={!!message.bot}
                userID={message.owner}
                botID={message.bot}
                is_continuation={message.is_continuation}
            />
            <View className='flex-1 items-start'>
                <MessageHeader
                    is_continuation={message.is_continuation}
                    userFullName={userFullName}
                    timestamp={message.formattedTime || ''}
                />
                {message.message_type === 'File' ? <FileMessageRenderer message={message} /> : null}
                {message.text ? <MessageTextRenderer text={message.text} /> : null}
                {/* <Text>{message.text}</Text> */}
            </View>
        </View>
    )
}

export default MessageItem
