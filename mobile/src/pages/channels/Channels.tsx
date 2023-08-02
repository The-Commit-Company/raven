import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonSpinner } from '@ionic/react';
import { IoAdd } from 'react-icons/io5';
import { RavenChannel } from '../../types/RavenChannelManagement/RavenChannel';
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk';
import { ErrorBanner } from '../../components/layout';
import { ChannelList } from '../../components/features/channels/ChannelList';
import { AddChannel } from '../../components/features/channels';
import { useRef } from 'react';

export const Channels = () => {

    const pageRef = useRef()
    const { data, error, mutate, isLoading } = useFrappeGetCall<{ message: RavenChannel[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    useFrappeEventListener('channel_list_updated', () => {
        mutate()
    })

    return (
        <IonPage ref={pageRef}>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Channels</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" translucent>
                    <IonToolbar>
                        <IonTitle size="large">Channels</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {isLoading && <div className='text-center'><IonSpinner name='crescent' color='medium' /></div>}
                {error && <ErrorBanner error={error} />}
                <IonItem lines='none' button id='channel-create'>
                    <div slot='start'>
                        <IoAdd size='24' color='var(--ion-color-medium)' />
                    </div>
                    <IonLabel color='medium'>
                        Add Channel
                    </IonLabel>
                </IonItem>
                <ChannelList data={data?.message ?? []} />
                <AddChannel presentingElement={pageRef.current} />
            </IonContent>
        </IonPage>
    )
}