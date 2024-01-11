import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { ChannelInfoEditModal } from "./ChannelInfoEditModal"

export const ChannelInfoButton = ({ channel, pageRef }: { channel: ChannelListItem, pageRef: React.MutableRefObject<undefined> }) => {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IonItem button onClick={() => setIsOpen(true)} lines='full'>
                <div slot='start'>
                    {channel.type === 'Public' && <BiHash size='18' color='var(--ion-color-medium)' />}
                    {channel.type === 'Private' && <BiLockAlt size='18' color='var(--ion-color-medium)' />}
                    {channel.type === 'Open' && <BiGlobe size='18' color='var(--ion-color-medium)' />}
                </div>
                <IonLabel>
                    <h2>{channel.channel_name}</h2>
                    <p>{channel.channel_description}</p>
                </IonLabel>
            </IonItem>
            <ChannelInfoEditModal isOpen={isOpen} onDismiss={() => setIsOpen(false)} channel={channel} presentingElement={pageRef.current} />
        </>
    )
}