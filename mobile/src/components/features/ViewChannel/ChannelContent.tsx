import { IonItem, IonList, IonText } from '@ionic/react'
import { useContext } from 'react'
import { ChannelContext, Message } from '../../../pages/channels/ViewChannel'
import { MarkdownRenderer } from './MarkdownRenderer'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { getFileExtensionIcon } from '../../../utils/layout/fileExtensions'

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
    const { url } = useContext(FrappeContext) as FrappeConfig
    return <IonItem className='flex py-4 items-start'>
        <div style={{ height: "40px", width: "40px", maxWidth: "40px" }} className='w-1/5'>
            <img style={{ height: "40px", width: "100%", objectFit: 'cover', borderRadius: '4px' }} src={url + channelMembers[message.owner].user_image} alt={channelMembers[message.owner].full_name} />
        </div>
        <div className='ml-3 w-4/5'>
            <div style={{ lineHeight: 0.5 }} className='mb-2'>
                <IonText className='font-semibold text-sm' style={{ lineHeight: 0 }}>{channelMembers[message.owner].full_name}</IonText>
            </div>
            {message.message_type === 'Text' && <MarkdownRenderer content={message.text} />}
            {message.message_type === 'File' && message.file && <div className='flex items-center'>
                <div>{getFileExtensionIcon(message?.file?.split('.')[1])}</div>
                <a className='ml-1' target="_blank" href={url + message.file}>
                    <IonText color='dark'>{message?.file?.split('/')[3]}</IonText>
                </a>
            </div>}
            {message.message_type === 'Image' && <div><img className='mt-4' src={url + message.file ?? ''} alt={'Image sent by ' + message.owner} /></div>}
        </div>
    </IonItem>
}