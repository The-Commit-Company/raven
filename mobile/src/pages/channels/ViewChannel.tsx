import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import React, { createContext, ReactElement, useMemo } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ChannelHeader } from '../../components/features/ViewChannel'
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
                <IonContent fullscreen>
                </IonContent>
            </IonPage>
        </ChannelContext.Provider>
    )
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: ChannelData }>({ channelMembers: {} })