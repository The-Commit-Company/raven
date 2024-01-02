import { IonBadge, IonItem, IonLabel } from '@ionic/react'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { ChannelListItem, UnreadCountData } from '@/utils/channel/ChannelListProvider'
import { useMemo } from 'react'

interface ChannelListProps {
    data: ChannelListItem[],
    unread_count?: UnreadCountData
}

export const ChannelList = ({ data, unread_count }: ChannelListProps) => {
    return (
        <div className='pb-4'>
            {data?.map(channel => <ChannelItem
                channel={channel}
                unreadCount={unread_count?.channels ?? []}
                key={channel.name} />)}
        </div>
    )
}

const ChannelItem = ({ channel, unreadCount }: { channel: ChannelListItem, unreadCount: UnreadCountData['channels'] }) => {

    const unreadCountForChannel = useMemo(() => unreadCount.find((unread) => unread.name == channel.name)?.unread_count, [channel.name, unreadCount])

    return (
        <IonItem key={channel.name} detail={false} lines='none' routerLink={`/channel/${channel.name}`}>
            <div slot='start' className='flex items-center space-x-4 w-5/6'>
                <div slot='start'>
                    {channel.type === "Private" ? <BiLockAlt size='24' color='var(--ion-color-dark)' /> : channel.type === "Public" ? <BiHash size='24' color='var(--ion-color-dark)' /> :
                        <BiGlobe size='24' color='var(--ion-color-dark)' />}
                </div>
                <IonLabel slot='end'>{channel.channel_name}</IonLabel>
            </div>
            {unreadCountForChannel ? <IonBadge>{unreadCountForChannel < 100 ? unreadCountForChannel : '99'}</IonBadge> : null}
        </IonItem>
    )
}