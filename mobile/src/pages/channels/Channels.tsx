import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonSearchbar, useIonModal } from '@ionic/react';
import { IoAdd } from 'react-icons/io5';
import { ErrorBanner, FullPageLoader } from '../../components/layout';
import { ChannelList } from '../../components/features/channels/ChannelList';
import { AddChannel } from '../../components/features/channels';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChannelList } from '@/utils/channel/ChannelListProvider';

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
                <IonToolbar>
                    <IonSearchbar
                        spellCheck
                        onIonInput={(e) => setSearchInput(e.detail.value!)}
                    >
                    </IonSearchbar>
                </IonToolbar>
                {isLoading && <FullPageLoader />}
                {error && <ErrorBanner error={error} />}
                <IonItem lines='none' button onClick={() => setIsOpen(true)}>
                    <div slot='start'>
                        <IoAdd size='24' color='var(--ion-color-medium)' />
                    </div>
                    <IonLabel color='medium'>
                        Add Channel
                    </IonLabel>
                </IonItem>
                <ChannelList data={filteredChannels ?? []} />
                <AddChannel isOpen={isOpen} onDismiss={() => setIsOpen(false)} presentingElement={pageRef.current} />
            </IonContent>
        </IonPage>
    )
}