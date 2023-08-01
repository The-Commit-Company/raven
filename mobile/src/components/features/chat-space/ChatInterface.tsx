import { IonBackButton, IonButtons, IonFooter, IonHeader, IonPage, IonToolbar } from '@ionic/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { useContext, useState } from 'react'
import { Message, MessagesWithDate } from '../../../../../raven-app/src/types/Messaging/Message'
import { ChannelContext } from '../../../utils/channel/ChannelProvider'
import { ErrorBanner, FullPageLoader } from '../../layout'
import { ChannelData } from '../channels/Channels'
import { ChatInput } from '../chat-input'
import { ChatHeader } from './ChatHeader'
import { ChatHistory } from './ChatHistory'

export const ChatInterface = () => {

    const { channelData, users } = useContext(ChannelContext)

    const { data: messages, error: messagesError, mutate: refreshMessages, isLoading: isMessageLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channelData?.name
    }, undefined, {
        revalidateOnFocus: false
    })

    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list", undefined, undefined, {
        revalidateOnFocus: false
    })

    const onMessageSend = () => {
        refreshMessages()
    }

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }

    const allUsers = Object.values(users).map((user) => {
        return {
            id: user.name,
            value: user.full_name ?? ''
        }
    })

    const allChannels = channelList?.message.map((channel: ChannelData) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })

    if (channelData && allUsers && allChannels)
        return (
            <IonPage>
                <IonHeader translucent>
                    <IonToolbar>
                        <IonButtons>
                            <IonBackButton text='' defaultHref="/channels" />
                        </IonButtons>

                        <ChatHeader />
                    </IonToolbar>
                </IonHeader>
                {isMessageLoading && <FullPageLoader />}
                {messagesError && <ErrorBanner heading="There was an error while fetching the messages.">
                    {messagesError.exception} - {messagesError.httpStatus}
                </ErrorBanner>}
                {messages && <ChatHistory messages={messages.message} />}
                <IonFooter className='text-white'>
                    <div className='chat-input'>
                        <ChatInput channelID={channelData.name} allMembers={allUsers} allChannels={allChannels} onMessageSend={onMessageSend} selectedMessage={selectedMessage} handleCancelReply={handleCancelReply} />
                    </div>
                </IonFooter>
            </IonPage>
        )

    else return (
        <FullPageLoader />
    )
}