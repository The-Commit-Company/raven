import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonFooter } from '@ionic/react'
import { useFrappeGetCall, useFrappeGetDocList } from 'frappe-react-sdk'
import React, { createContext, createRef, ReactElement, useEffect, useMemo } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ErrorBanner, FullPageLoader } from '../../components/common'
import { ChannelContent, ChannelHeader } from '../../components/features/ViewChannel'
import { ChatInput } from '../../components/features/ViewChannel/ChatInput'
import { useFrappeEventListener } from '../../hooks/useFrappeEventListener'

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

export interface Message {
    text: string,
    creation: Date,
    name: string,
    owner: string
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
    })

    const contentRef = createRef<HTMLIonContentElement>();
    const { data: messages, error: messagesError, mutate: refreshMessages, isLoading: isMessageLoading } = useFrappeGetDocList<Message>('Raven Message', {
        fields: ["text", "creation", "name", "owner"],
        filters: [["channel_id", "=", channelID]],
        orderBy: {
            field: "creation",
            order: 'desc'
        },
        limit: 500
    })

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollToBottom(100)
        }
    }, [messages])


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
            .then(() => {
                if (contentRef.current) {
                    contentRef.current.scrollToBottom(100)
                }
            })
    }

    // const allChannels = channelList?.message.map((channel) => {
    //     return {
    //         id: channel.name,
    //         value: channel.channel_name
    //     }
    // })

    return (
        <ChannelContext.Provider value={{ channelMembers: channelMembersObject, channelData: data?.message.channel_data }}>
            <IonPage>
                <IonHeader translucent>
                    <IonButtons>
                        <IonBackButton defaultHref="/channels" />
                    </IonButtons>
                    <IonToolbar>
                        <ChannelHeader />
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen ref={contentRef}>
                    {isMessageLoading && <FullPageLoader />}
                    {messagesError && <ErrorBanner heading="There was an error while fetching the messages">
                        {messagesError.exception}
                    </ErrorBanner>}
                    {messages && <ChannelContent messages={messages} />}
                </IonContent>
                <IonFooter className='text-white'>
                    <div className='chat-input'>
                        <ChatInput channelID={channelID} allMembers={allMembers} allChannels={[]} onMessageSend={onMessageSend} />
                    </div>
                </IonFooter>
            </IonPage>
        </ChannelContext.Provider>
    )
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: ChannelData }>({ channelMembers: {} })