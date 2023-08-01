import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonSpinner } from '@ionic/react';
import { IoAdd } from 'react-icons/io5';
import { RavenChannel } from '../../types/RavenChannelManagement/RavenChannel';
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk';
import { ErrorBanner } from '../../components/layout';
import { ChannelList } from '../../components/features/channels/ChannelList';

export const Channels = () => {

    const { data, error, mutate, isLoading } = useFrappeGetCall<{ message: RavenChannel[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

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
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Channels</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" translucent>
                    <IonToolbar>
                        <IonTitle size="large">Raven</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div className='ion-padding-horizontal py-2'>
                    <IonLabel className='text-sm font-medium' color='medium'>Channels</IonLabel>
                </div>
                <ChannelList data={data?.message ?? []} />
                <IonItem lines='none'>
                    <div slot='start'>
                        <IoAdd size='24' color='var(--ion-color-medium)' />
                    </div>
                    <IonLabel color='medium'>
                        Add Channel
                    </IonLabel>
                </IonItem>
            </IonContent>
        </IonPage>
    )
}