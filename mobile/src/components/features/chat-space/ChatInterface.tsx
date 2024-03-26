import { IonHeader, IonFooter, IonContent, useIonViewWillEnter } from '@ionic/react'
import { useFrappeDocumentEventListener, useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk'
import { useCallback, useContext, useMemo, useRef } from 'react'
import { MessagesWithDate } from '../../../../../types/Messaging/Message'
import { ErrorBanner } from '../../layout'
import { ChatInput } from '../chat-input'
import { ChatView } from './chat-view/ChatView'
import { ChatHeader } from './chat-header'
import { ChannelListItem, DMChannelListItem, useChannelList } from '@/utils/channel/ChannelListProvider'
import { UserFields } from '@/utils/users/UserListProvider'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { UserContext } from '@/utils/auth/UserProvider'
import { ChatLoader } from '@/components/layout/loaders/ChatLoader'
import { MessageActionModal, useMessageActionModal } from './MessageActions/MessageActionModal'
import { Button } from '@/components/ui/button'
import { BsPeople } from "react-icons/bs";
import { BiChevronLeft } from "react-icons/bi";
import { Link, useHistory } from 'react-router-dom'
import { IconButton } from '@/components/ui/icon-button'

export type ChannelMembersMap = Record<string, UserFields>

export const ChatInterface = ({ channel }: { channel: ChannelListItem | DMChannelListItem }) => {

    const { currentUser } = useContext(UserContext)
    const initialDataLoaded = useRef(false)
    const conRef = useRef<HTMLIonContentElement>(null);

    const scrollToBottom = useCallback((duration = 0, delay = 0) => {
        setTimeout(() => {
            conRef.current?.scrollToBottom(duration)
        }, delay)
    }, [])

    useIonViewWillEnter(() => {
        scrollToBottom(0, 0)
    })

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
    const { data: messages, error: messagesError, mutate: refreshMessages, isLoading: isMessageLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.api.raven_message.get_messages_with_dates", {
        channel_id: channel.name
    }, `get_messages_for_channel_${channel.name}`, {
        keepPreviousData: true,
        onSuccess: (data) => {
            onNewMessageLoaded()
        }
    })

    useFrappeDocumentEventListener('Raven Channel', channel.name, () => { })

    /** Realtime event listener to update messages */
    useFrappeEventListener('message_updated', (data) => {
        //If the message is sent on the current channel
        if (data.channel_id === channel.name) {
            //If the sender is not the current user
            if (data.sender !== currentUser) {
                refreshMessages()
            }
        }
    })

    const { data: channelMembers } = useFrappeGetCall<{ message: ChannelMembersMap }>('raven.api.chat.get_channel_members', {
        channel_id: channel.name
    }, undefined, {
        revalidateOnFocus: false,
    })

    const onMessageSend = () => {
        Haptics.impact({
            style: ImpactStyle.Light
        })
        refreshMessages()
            .then(() => {
                scrollToBottom(0, 100)
            })
    }

    const { selectedMessage, onMessageSelected, onDismiss } = useMessageActionModal()

    const { channels } = useChannelList()

    const parsedChannels = useMemo(() => {
        return channels.map(c => ({ id: c.name, value: c.channel_name }))
    }, [channels])

    const parsedMembers = useMemo(() => {
        if (channelMembers) {
            return Object.values(channelMembers.message).map((member) => ({ id: member.name, value: member.full_name }))
        }
        return []
    }, [channelMembers])

    const checkIsOpenChannel = () => (channel.type !== 'Open' && !channel.is_direct_message)

    const history = useHistory()

    return (
        <>
            <IonHeader>
                <div className='px-4 py-2 inset-x-0 top-0 overflow-hidden min-h-5 bg-background border-b-foreground/10 border-b'>
                    <div className='flex gap-5 items-center'>
                        <div className='flex items-center'>
                            <IconButton variant="ghost" icon={BiChevronLeft} onClick={() => history.goBack()} className='focus:bg-accent/40' />
                        </div>
                        <div className='flex items-center justify-between gap-2 w-full'>
                            <ChatHeader channel={channel} />
                            {
                                checkIsOpenChannel() && <div className='flex items-center'>
                                    {/* do not show settings button for open channels */}
                                    <Button variant="ghost" asChild className='hover:bg-transparent px-0 py-0 h-auto'>
                                        <Link to={`${channel.name}/channel-settings`}>
                                            <BsPeople size="18" className='text-foreground/80' />
                                        </Link>
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </IonHeader>
            <IonContent className='flex flex-col-reverse' fullscreen ref={conRef}>
                {isMessageLoading && <ChatLoader />}
                {messagesError && <ErrorBanner error={messagesError} />}
                <ChatView messages={messages?.message ?? []} members={channelMembers?.message ?? {}} onMessageSelected={onMessageSelected} />

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

            <IonFooter
                hidden={!!messagesError}
                className='block relative z-10 order-1 w-full'
            >
                <div
                    className='overflow-visible 
                    text-foreground
                    bg-background
                    border-t-foreground/10 
                    border-t-[1px]
                    pb-6
                    pt-1'
                >
                    <ChatInput channelID={channel.name} allMembers={parsedMembers} allChannels={parsedChannels} onMessageSend={onMessageSend} />
                </div>
            </IonFooter>
            <MessageActionModal selectedMessage={selectedMessage} onDismiss={onDismiss} />
        </>
    )

}