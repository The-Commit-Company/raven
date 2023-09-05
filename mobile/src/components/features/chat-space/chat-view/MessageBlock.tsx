import React, { memo, useContext, useMemo } from 'react'
import { FileMessage, Message, MessageBlock, TextMessage } from '../../../../../../types/Messaging/Message'
import { ChannelMembersMap } from '../ChatInterface'
import { IonIcon, IonItem, IonText } from '@ionic/react'
import { SquareAvatar, UserAvatar } from '@/components/common/UserAvatar'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { UserFields } from '@/utils/users/UserListProvider'
import { DateObjectToFormattedDateString, DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString } from '@/utils/operations/operations'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { ChannelMembersContext } from './ChatView'
import { openOutline } from 'ionicons/icons'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { useIsUserActive } from '@/hooks/useIsUserActive'

type Props = {
    message: MessageBlock,
}

export const MessageBlockItem = ({ message }: Props) => {
    const members = useContext(ChannelMembersContext)
    /**
     * Displays a message block in the chat interface
     * A message can have the following properties:
     * 1. Is Continuation - if it is, no need to show Avatar and timestamp
     * 2. Is Reply - if it is, show the reply message above the message in the same box
     * 3. Message Type - Text, Image, File - will need to show the content accordingly
     */

    const user = members[message.data.owner]
    return (
        <div className='px-2 my-0.5' id={`message-${message.data.name}`}>
            {message.data.is_continuation === 0 ? <NonContinuationMessageBlock message={message} user={user} /> :
                <ContinuationMessageBlock message={message} />}
        </div>
    )
}

const NonContinuationMessageBlock = ({ message, user }: { message: MessageBlock, user?: UserFields }) => {
    return <div className='px-2 mt-3 pt-1 rounded-md flex active:bg-[color:var(--ion-color-light)]'>
        <UserAvatarBlock message={message} user={user} />
        <div>
            <div className='flex items-end pb-0.5'>
                <IonText className='font-bold text-xs'>{user?.full_name ?? message.data.owner}</IonText>
                <IonText className='font-normal text-xs pl-2' color='medium'>{DateObjectToTimeString(message.data.creation)}</IonText>
            </div>
            <MessageContent message={message} />
        </div>
    </div>
}

const UserAvatarBlock = ({ message, user }: { message: MessageBlock, user?: UserFields }) => {

    const isActive = useIsUserActive(user?.name ?? message.data.owner)
    return <div className='w-11 mt-1.5'>
        <SquareAvatar alt={user?.full_name ?? message.data.owner} src={user?.user_image} isActive={isActive} />
    </div>
}

const ContinuationMessageBlock = ({ message }: { message: MessageBlock }) => {
    return <div className='px-2 flex rounded-md  active:bg-[color:var(--ion-color-light)]'>
        <div className='w-11'>
        </div>
        <MessageContent message={message} />
    </div>
}

const MessageContent = ({ message }: { message: MessageBlock }) => {

    return <div className='min-w-[100px] max-w-[280px]'>
        {message.data.is_reply === 1 && message.data.linked_message && <ReplyBlock linked_message={message.data.linked_message} />}
        {message.data.message_type === 'Text' && <TextMessageBlock message={message.data} />}
        {message.data.message_type === 'Image' && <ImageMessageBlock message={message.data} />}
        {message.data.message_type === 'File' && <FileMessageBlock message={message.data} />}
    </div>
}

const TextMessageBlock = ({ message, truncate = false }: { message: TextMessage, truncate?: boolean }) => {


    return <div className='py-0.5 rounded-lg text-md'>
        <MarkdownRenderer content={message.text} truncate={truncate} />
    </div>
}

const ImageMessageBlock = ({ message }: { message: FileMessage }) => {

    return <div className='py-0.5 rounded-lg'>
        <img src={message.file} alt={`Image`} className='rounded-md' />
    </div>
}

const FileMessageBlock = ({ message }: { message: FileMessage }) => {

    return <div className='py-0.5 rounded-md bg-[color:var(--ion-color-light-shade)]'>
        <p className='p-2 text-sm'>
            📎 &nbsp;{message.file?.split('/')[3]}
        </p>
        <div className='mt-2 text-center'>
            <a
                className='w-full py-2 flex 
                items-center 
                space-x-1.5 
                justify-center border-t-2
                rounded-b-md
                border-t-[color:var(--ion-color-primary-shade)] 
                [color:var(--ion-color-primary)] text-sm
                active:bg-[color:var(--ion-color-primary-shade)]
                active:text-[color:var(--ion-color-dark)]'
                target='_blank'
                href={message.file}
            >
                <span>View File</span>
                <IonIcon icon={openOutline} className='inline-block ml-1' />
            </a>
        </div>
    </div>
}

const ReplyBlock = ({ linked_message }: { linked_message: string }) => {
    const members = useContext(ChannelMembersContext)
    const { data } = useFrappeGetDoc<Message>('Raven Message', linked_message)

    const user = useMemo(() => {
        if (data) {
            return members[data.owner]
        } else {
            return undefined
        }
    }, [data])

    const scrollToMessage = () => {
        Haptics.impact({
            style: ImpactStyle.Light
        })
        document.getElementById(`message-${linked_message}`)?.scrollIntoView({ behavior: 'smooth' })
    }

    const date = data ? new Date(data?.creation) : null
    return <div onClick={scrollToMessage} className='px-2 py-1.5 my-0.5 mb-2 rounded-e-sm bg-[color:var(--ion-color-light-shade)] border-l-2 border-l-[color:var(--ion-color-medium)]'>
        {data && <div>
            <div className='flex items-end pb-1'>
                <IonText className='font-bold text-xs'>{user?.full_name ?? data.owner}</IonText>
                {date && <IonText className='font-normal text-xs pl-2' color='medium'>on {DateObjectToFormattedDateStringWithoutYear(date)} at {DateObjectToTimeString(date)}</IonText>}
            </div>
            {data.message_type === 'Text' && <TextMessageBlock message={data} truncate />}
            {data.message_type === 'Image' && <div className='flex items-center space-x-2'>
                <img src={data.file} alt={`Image`} className='inline-block w-10 h-10 rounded-md' />
                <p className='text-sm font-semibold'>📸 &nbsp;Image</p>
            </div>}
            {data.message_type === 'File' && <p
                className='text-sm font-semibold'>📎 &nbsp;{data.file?.split('/')[3]}</p>}
        </div>
        }
    </div>
}