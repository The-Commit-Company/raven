import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonSearchbar, useIonModal } from '@ionic/react';
import { IoAdd } from 'react-icons/io5';
import { ErrorBanner } from '../../components/layout';
import { ChannelList } from '../../components/features/channels/ChannelList';
import { AddChannel } from '../../components/features/channels';
import { useMemo, useRef, useState } from 'react';
import { UnreadCountData, useChannelList } from '@/utils/channel/ChannelListProvider';
import { ChannelListLoader } from '../../components/layout/loaders/ChannelListLoader';
import { useFrappeEventListener, useFrappeGetCall } from 'frappe-react-sdk';

export const Channels = () => {

    const pageRef = useRef()

    const [isOpen, setIsOpen] = useState(false)

    const { channels, isLoading, error } = useChannelList()

    const [searchInput, setSearchInput] = useState('')

    const filteredChannels = useMemo(() => {
        if (!channels) return []
        const activeChannels = channels.filter(channel => channel.is_archived == 0)
        const searchTerm = searchInput.toLowerCase()
        if (!searchTerm) return activeChannels
        return activeChannels.filter(channel => channel.channel_name.includes(searchTerm))
    }, [searchInput, channels])

    const { data: unread_count, mutate: update_count } = useFrappeGetCall<{ message: UnreadCountData }>("raven.raven_messaging.doctype.raven_message.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        // revalidateOnFocus: false,
    })
    useFrappeEventListener('raven:unread_channel_count_updated', () => {
        update_count()
    })

    return (
        <IonPage ref={pageRef}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Channels</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Channels</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonToolbar>
                    <IonSearchbar
                        spellCheck
                        onIonInput={(e) => setSearchInput(e.detail.value!)}>
                    </IonSearchbar>
                </IonToolbar>
                {isLoading && <ChannelListLoader />}
                {error && <ErrorBanner error={error} />}
                <IonItem lines='none' button onClick={() => setIsOpen(true)}>
                    <div slot='start'>
                        <IoAdd size='24' color='var(--ion-color-medium)' />
                    </div>
                    <IonLabel color='medium'>
                        Add Channel
                    </IonLabel>
                </IonItem>
                <ChannelList data={filteredChannels ?? []} unread_count={unread_count?.message}/>
                <AddChannel isOpen={isOpen} onDismiss={() => setIsOpen(false)} presentingElement={pageRef.current} />
            </IonContent>
        </IonPage>
    )
}