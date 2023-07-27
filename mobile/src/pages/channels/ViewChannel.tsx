import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonFooter } from '@ionic/react'
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import React, { createContext, createRef, ReactElement, useEffect, useMemo, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ErrorBanner, FullPageLoader } from '../../components/common'
import { ChannelContent, ChannelHeader } from '../../components/features/ViewChannel'
import { ChatInput } from '../../components/features/ChatInput/ChatInput'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { Message, MessagesWithDate } from "../../../../raven-app/src/types/Messaging/Message"
import { User } from '../../../../raven-app/src/types/User/User'

export type ChannelData = {
    name: string,
    channel_name: string,
    type: string,
    is_direct_message: number,
    is_self_message: number,
    creation: string,
    owner: string,
    channel_description: string,
    owner_full_name: string
}

type ChannelInfo = {
    channel_members: ChannelMembersDetails[],
    channel_data: ChannelData
}

type ChannelMembersDetails = {
    name: string,
    first_name: string,
    full_name: string,
    user_image: string
}

type IdentityParam = { channelID: string }

export const ViewChannel = (props: RouteComponentProps<IdentityParam>): ReactElement => {

    const { channelID } = props.match.params
    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelInfo }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members_and_data', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })

    const { data: users, error: usersError } = useFrappeGetCall<{ message: User[] }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_raven_users_list', undefined, undefined, {
        revalidateOnFocus: false
    })

    const { data: messages, error: messagesError, mutate: refreshMessages, isLoading: isMessageLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })

    useFrappeEventListener('member_added', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    useFrappeEventListener('member_removed', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    useFrappeEventListener('channel_updated', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    const channelMembersObject = useMemo(() => {
        const cm: Record<string, ChannelMembersDetails> = {}
        data?.message.channel_members.forEach((member: ChannelMembersDetails) => {
            cm[member.name] = member
        })
        return cm
    }, [data])

    const userDataObject = useMemo(() => {
        const userData: Record<string, User> = {}
        users?.message.forEach((user: User) => {
            userData[user.name] = user
        })
        return userData
    }, [users])

    useFrappeEventListener('message_received', (data) => {
        if (data.channel_id === channelID) {
            refreshMessages()
        }
    })

    useFrappeEventListener('message_deleted', (data) => {
        if (data.channel_id === channelID) {
            refreshMessages()
        }
    })

    useFrappeEventListener('message_updated', (data) => {
        if (data.channel_id === channelID) {
            refreshMessages()
        }
    })

    const allMembers = Object.values(channelMembersObject).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
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

    // const allChannels = channelList?.message.map((channel) => {
    //     return {
    //         id: channel.name,
    //         value: channel.channel_name
    //     }
    // })

    return (
        <ChannelContext.Provider value={{ channelMembers: channelMembersObject, channelData: data?.message.channel_data, users: userDataObject }}>
            <IonPage>
                <IonHeader translucent>
                    <IonToolbar>
                        <IonButtons>
                            <IonBackButton text='' defaultHref="/channels" />
                        </IonButtons>

                        <ChannelHeader />
                    </IonToolbar>
                </IonHeader>
                {isMessageLoading && <FullPageLoader />}
                {messagesError && <ErrorBanner heading="There was an error while fetching the messages.">
                    {messagesError.exception} - {messagesError.httpStatus}
                </ErrorBanner>}
                {messages && <ChannelContent messages={messages.message} />}
                <IonFooter className='text-white'>
                    <div className='chat-input'>
                        <ChatInput channelID={channelID} allMembers={allMembers} allChannels={[]} onMessageSend={onMessageSend} selectedMessage={selectedMessage} handleCancelReply={handleCancelReply} />
                    </div>
                </IonFooter>
            </IonPage>
        </ChannelContext.Provider>
    )
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: ChannelData; users: Record<string, User> }>({ channelMembers: {}, users: {} })