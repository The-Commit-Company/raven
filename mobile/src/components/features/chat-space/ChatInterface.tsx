import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonToolbar } from '@ionic/react'
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { useCallback, useRef, useState } from 'react'
import { Message, MessagesWithDate } from '../../../../../types/Messaging/Message'
import { ErrorBanner, FullPageLoader } from '../../layout'
import { ChatInput } from '../chat-input'
import { ChatView } from './chat-view/ChatView'
import { ChatHeader } from './chat-header'
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { UserFields } from '@/utils/users/UserListProvider'
import { peopleOutline, searchOutline } from 'ionicons/icons'

export type ChannelMembersMap = Record<string, UserFields>

export const ChatInterface = ({ channel }: { channel: ChannelListItem | DMChannelListItem }) => {

    const initialDataLoaded = useRef(false)
    const conRef = useRef<HTMLIonContentElement>(null);

    const scrollToBottom = useCallback((duration = 0, delay = 0) => {


        setTimeout(() => {
            conRef.current?.scrollToBottom(duration)
        }, delay)
    }, [])

    const onNewMessageLoaded = useCallback(() => {
        /**
                 * We need to scroll to the bottom of the chat interface if the user is already at the bottom.
                 * If the user is not at the bottom, we need to show a button to scroll to the bottom.
        */
        if (conRef.current && !initialDataLoaded.current) {
            scrollToBottom(0, 100)
            initialDataLoaded.current = true
        } else {
            conRef.current?.getScrollElement().then((scrollElement) => {

                const scrollHeight = scrollElement.scrollHeight
                const clientHeight = scrollElement.clientHeight
                const scrollTop = scrollElement.scrollTop
                const isAtBottom = scrollHeight <= scrollTop + clientHeight
                if (isAtBottom) {
                    scrollToBottom(0, 100)
                } else {
                    // setNewMessagesAvailable(true)
                }
            })
        }

    }, [scrollToBottom, conRef])

    /**
     * We have the channel data. We also have the channel list in a global context.
     * Now we need to fetch:
     * 1. All the messages in the channel - this is done outside and then sent to the ChatHistory component
     * 2. All the users in the channel
     * 
     * */
    // Fetch all the messages in the channel
    const { data: messages, error: messagesError, mutate: refreshMessages, isLoading: isMessageLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channel.name
    }, undefined, {
        keepPreviousData: true,
        onSuccess: (data) => {
            onNewMessageLoaded()
        }
    })

    /** Realtime event listener to update messages */
    useFrappeEventListener('message_updated', (d) => {
        if (d.channel_id === channel.name) {
            refreshMessages()
        }
    })

    const { data: channelMembers } = useFrappeGetCall<{ message: ChannelMembersMap }>('raven.api.chat.get_channel_members', {
        channel_id: channel.name
    }, undefined, {
        revalidateOnFocus: false,
    })

    const onMessageSend = () => {
        refreshMessages()
            .then(() => {
                scrollToBottom(0, 100)
            })
    }

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }
    return (
        <>
            <IonHeader translucent>
                <IonToolbar>
                    <IonButtons slot='start'>
                        <IonBackButton color='medium' text='' defaultHref="/channels" />
                    </IonButtons>
                    <ChatHeader channel={channel} />
                    <IonButtons slot='end'>
                        {/* <IonButton color='medium'>
                            <IonIcon slot='icon-only' icon={searchOutline} />
                        </IonButton> */}
                        {/* <IonButton color='medium'>
                            <IonIcon slot='icon-only' icon={peopleOutline} />
                        </IonButton> */}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className='flex flex-col-reverse' fullscreen ref={conRef}>
                {isMessageLoading && <FullPageLoader />}
                {messagesError && <ErrorBanner error={messagesError} />}
                <ChatView messages={messages?.message ?? []} members={channelMembers?.message ?? {}} />

                {/* Commented out the button because it was unreliable. We only scroll to bottom when the user is at the bottom. */}
                {/* <IonButton
                    size='small'
                    type="button"
                    onClick={() => scrollToBottom(200, 0)}
                    hidden={!newMessagesAvailable}
                    shape='round'
                    // fill="outline"
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 "
                >

                    New messages
                    <IonIcon slot="end" icon={arrowDownOutline} />
                </IonButton> */}
                <div className='h-8'>
                </div>
            </IonContent>

            <IonFooter className='text-white' hidden={!!messagesError}>
                <ChatInput channelID={channel.name} allMembers={[]} allChannels={[]} onMessageSend={onMessageSend} selectedMessage={selectedMessage} handleCancelReply={handleCancelReply} />
            </IonFooter>
        </>
    )

}