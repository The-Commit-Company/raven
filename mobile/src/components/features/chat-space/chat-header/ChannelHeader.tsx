import { useContext, useRef } from "react"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"
import { BiGlobe, BiHash, BiLock } from "react-icons/bi"
import { IonButton, IonIcon, IonText, IonTitle } from "@ionic/react"
import { personAdd } from 'ionicons/icons';
import { AddChannelMembers } from "../../channels";
import { ChannelListItem } from "@/utils/channel/ChannelListProvider";

export const ChannelHeader = ({ channel }: { channel: ChannelListItem }) => {

    return (
        <IonTitle>
            <div className='flex flex-col items-center justify-start'>
                <div className='flex items-center justify-start'>
                    {channel.type === 'Private' ? <BiLock fontSize={'24px'} /> : channel.type === 'Public' ? <BiHash fontSize={'24px'} /> : <BiGlobe fontSize={'24px'} />}
                    <h1 className='ml-2'>
                        {channel.channel_name}
                    </h1>
                </div>
            </div>
        </IonTitle>
    )
}