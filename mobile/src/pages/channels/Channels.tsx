import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSearchbar, IonItem, IonLabel } from '@ionic/react';
import { ErrorBanner } from '../../components/layout';
import { ChannelList } from '../../components/features/channels/ChannelList';
import { AddChannel } from '../../components/features/channels';
import { useMemo, useRef, useState } from 'react';
import { UnreadCountData, useChannelList } from '@/utils/channel/ChannelListProvider';
import { ChannelListLoader } from '../../components/layout/loaders/ChannelListLoader';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Text } from '@radix-ui/themes';
import { FiPlus } from 'react-icons/fi';

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

    const { data: unreadCount } = useFrappeGetCall<{ message: UnreadCountData }>("raven.api.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: true,
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
                        placeholder='Search'
                        autocapitalize="off"
                        onIonInput={(e) => setSearchInput(e.target.value!)}
                    >
                    </IonSearchbar>
                </IonToolbar>
                {isLoading && <ChannelListLoader />}
                {error && <ErrorBanner error={error} />}
                <ul>
                    <IonItem lines='none' onClick={() => setIsOpen(true)}>
                        <FiPlus size='20' className='text-gray-11' />
                        <IonLabel>
                            <Text size='3' weight='light' as='div' color='gray' className='px-2 font-medium'>Add Channel</Text>
                        </IonLabel>
                    </IonItem>
                    <ChannelList data={filteredChannels ?? []} unread_count={unreadCount?.message} />
                    <AddChannel isOpen={isOpen} onDismiss={() => setIsOpen(false)} presentingElement={pageRef.current} />
                </ul>
            </IonContent>
        </IonPage>
    )
}