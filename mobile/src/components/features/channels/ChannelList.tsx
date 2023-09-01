import { IonItem, IonLabel } from '@ionic/react'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { RavenChannel } from '../../../../../types/RavenChannelManagement/RavenChannel'

interface ChannelListProps {
    data: RavenChannel[]
}

export const ChannelList = ({ data }: ChannelListProps) => {
    return (
        <div>
            {data?.map(channel => <IonItem key={channel.name} detail={false} lines='none' routerLink={`channel/${channel.name}`}>
                <div slot='start'>
                    {channel.type === "Private" ? <BiLockAlt size='24' color='var(--ion-color-dark)' /> : channel.type === "Public" ? <BiHash size='24' color='var(--ion-color-dark)' /> :
                        <BiGlobe size='24' color='var(--ion-color-dark)' />}
                </div>
                <IonLabel>{channel.channel_name}</IonLabel>
            </IonItem>)}
        </div>
    )
}