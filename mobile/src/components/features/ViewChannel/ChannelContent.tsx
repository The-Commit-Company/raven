import { IonItem, IonList, IonText } from '@ionic/react'
import { useContext } from 'react'
import { ChannelContext, Message } from '../../../pages/channels/ViewChannel'
import { MarkdownRenderer } from './MarkdownRenderer'

type Props = {
    messages: Message[]
}


export const ChannelContent = ({ messages }: Props) => {




    return (
        <IonList lines='none' className='flex flex-col-reverse'>
            {messages.map((message) => <MessageView key={message.name} message={message} />)}
        </IonList>
    )
}

const MessageView = ({ message }: { message: Message }) => {
    const { channelMembers } = useContext(ChannelContext)
    return <IonItem className='flex py-4 items-start'>
        <div style={{ height: "40px", width: "40px", maxWidth: "40px" }} className='w-1/5'>
            <img style={{ height: "40px", width: "100%", objectFit: 'cover', borderRadius: '4px' }} src={channelMembers[message.owner].user_image} alt={channelMembers[message.owner].full_name} />
        </div>
        <div className='ml-3 w-4/5'>
            <div style={{ lineHeight: 0.5 }} className='mb-2'>
                <IonText className='font-semibold text-sm' style={{ lineHeight: 0 }}>{channelMembers[message.owner].full_name}</IonText>
            </div>
            <MarkdownRenderer content={message.text} />
        </div>
    </IonItem>
}