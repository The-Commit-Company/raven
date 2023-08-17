import { IonAvatar, IonContent, IonItem, IonList, IonText } from '@ionic/react'
import { createRef, useContext, useEffect } from 'react'
import { MarkdownRenderer } from '../../common/MarkdownRenderer'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'
import { getFileExtensionIcon } from '../../../utils/layout/fileExtensions'
import { DateBlock, MessageBlock } from '../../../../../raven-app/src/types/Messaging/Message'
import Avatar from 'react-avatar'
import { ChatMessageBox } from '../chat-message/ChatMessageBox'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { getFileExtension } from '../../../utils/operations/operations'

type Props = {
    messages: (DateBlock | MessageBlock)[]
}


export const ChatHistory = ({ messages }: Props) => {

    const conRef = createRef<HTMLIonContentElement>();
    useEffect(() => {
        if (conRef.current) {
            conRef.current.scrollToPoint(0, 1000000000, 100)
        }
    }, [messages])

    return (
        <IonContent className='flex flex-col-reverse' ref={conRef}>
            <IonList lines='none' className='flex flex-col-reverse'>
                {messages.slice(0).reverse().map((message: DateBlock | MessageBlock) => {
                    if (message.block_type === "message")

                        return (
                            // <MessageView key={message.data.name} message={message} />
                            <ChatMessageBox key={message.data.name} message={message.data}>
                                {message.data.message_type === 'Text' && <MarkdownRenderer content={message.data.text} />}
                            </ChatMessageBox>

                        )
                }
                )}
            </IonList>
        </IonContent>
    )
}

const MessageView = ({ message }: { message: MessageBlock }) => {
    const { channelMembers } = useContext(ChannelContext)
    const { url } = useContext(FrappeContext) as FrappeConfig
    return <IonItem className='flex py-4 items-start'>
        {/* <div style={{ height: "40px", width: "40px", maxWidth: "40px" }} className='w-1/5'>
            <img style={{ height: "40px", width: "100%", objectFit: 'cover', borderRadius: '4px' }} src={url + channelMembers[message.data.owner]?.user_image} alt={channelMembers[message.data.owner]?.full_name} />
        </div> */}
        {message.data.is_continuation === 0 ? (channelMembers[message.data.owner]?.user_image ?
            <IonAvatar style={{ "--border-radius": "8px" }} className="h-10 w-10">
                <img src={url + channelMembers[message.data.owner]?.user_image} />
            </IonAvatar>
            :
            <Avatar src={url + channelMembers[message.data.owner]?.user_image} name={channelMembers[message.data.owner]?.full_name} size='40' round="8px" />)
            :
            <div style={{ height: "40px", width: "40px", maxWidth: "40px" }} className='w-1/5'></div>
        }
        <div className='ml-3 w-4/5'>
            {message.data.is_continuation === 0 && <div style={{ lineHeight: 0.5 }} className='mb-2'>
                <IonText className='font-semibold text-sm' style={{ lineHeight: 0 }}>{channelMembers[message.data.owner].full_name}</IonText>
            </div>}
            {message.data.message_type === 'Text' && <MarkdownRenderer content={message.data.text} />}
            {message.data.message_type === 'File' && message.data.file && <div className='flex items-center'>
                <div>{getFileExtensionIcon(getFileExtension(message?.data.file))}</div>
                <a className='ml-1' target="_blank" href={url + message.data.file}>
                    <IonText color='dark'>{message?.data.file?.split('/')[3]}</IonText>
                </a>
            </div>}
            {message.data.message_type === 'Image' && <div><img className='mt-4' src={url + message.data.file ?? ''} alt={'Image sent by ' + message.data.owner} /></div>}
        </div>
    </IonItem>
}