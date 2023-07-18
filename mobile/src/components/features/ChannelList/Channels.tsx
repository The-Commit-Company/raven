import { IonIcon, IonItem, IonLabel, IonList, IonSpinner } from '@ionic/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { lockClosedOutline } from 'ionicons/icons'
import React from 'react'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { ErrorBanner } from '../../common'

export type ChannelData = {
    name: string,
    channel_name: string,
    type: "Private" | "Public" | "Open",
    is_direct_message: number,
    is_self_message: number,
    creation: string,
    owner: string,
    channel_description: string,
    owner_full_name: string
}

export const Channels = () => {

    const { data, error, mutate, isLoading } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    useFrappeEventListener('channel_list_updated', () => {
        mutate()
    })

    if (error) {
        return <ErrorBanner heading={error.message}>{error.httpStatus} - {error.httpStatusText}</ErrorBanner>
    }

    if (isLoading) {
        return <div className='text-center'><IonSpinner name='crescent' color='medium' /></div>
    }

    return (
        <div>
            {data?.message.map(channel => <IonItem key={channel.name} detail={false} lines='none' routerLink={`channel/${channel.name}`}>
                <div slot='start'>
                    {channel.type === "Private" ? <BiLockAlt size='24' color='var(--ion-color-dark)' /> : channel.type === "Public" ? <BiHash size='24' color='var(--ion-color-dark)' /> :
                        <BiGlobe size='24' color='var(--ion-color-dark)' />}

                </div>
                <IonLabel>{channel.channel_name}</IonLabel>
            </IonItem>)}

        </div>
    )
}