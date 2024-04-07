import { Message, PollMessage } from '../../../../../../types/Messaging/Message'
import { UserFields } from '@/utils/users/UserListProvider'
import { MessageSenderAvatar } from '../chat-view/MessageBlock'
import { IonText } from '@ionic/react'
import { DateObjectToTimeString } from '@/utils/operations/operations'
import parse from 'html-react-parser';

type MessagePreview = { message: Message, user?: UserFields }

const MessagePreview = ({ message, user }: MessagePreview) => {
    return (
        <div className='px-2 mt-2 py-1 rounded-md flex'>
            <div className='-mt-0.5'>
                <MessageSenderAvatar user={user} userID={user?.name ?? ''} />
            </div>
            <div className='overflow-x-clip'>
                <div className='flex items-end pb-1.5'>
                    <IonText className='font-bold text-zinc-50 text-sm'>{user?.full_name ?? message.owner}</IonText>
                    <IonText className='text-xs pl-1.5 text-zinc-500'>{DateObjectToTimeString(message.creation)}</IonText>
                </div>
                {message.message_type === 'Text' && <div className='text-base line-clamp-3 text-ellipsis'>{parse(message.content ?? '')}</div>}
                {message.message_type === 'Image' && <div className='flex items-center space-x-2'>
                    <img src={message.file} alt={`Image`} className='inline-block w-10 h-10 rounded-md' />
                    <p className='text-sm font-semibold'>📸 &nbsp;Image</p>
                </div>}
                {message.message_type === 'File' && <p
                    className='text-sm font-semibold'>📎 &nbsp;{message.file?.split('/')[3]}</p>}
                {message.message_type === 'Poll' && <p className="text-sm font-semibold line-clamp-2 flex items-center">
                    📊 &nbsp;Poll: {(message as PollMessage).content?.split("\n")?.[0]}</p>}
            </div>
        </div>
    )
}

export default MessagePreview