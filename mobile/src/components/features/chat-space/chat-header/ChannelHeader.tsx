import { useContext, useRef } from "react"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"
import { BiGlobe, BiHash, BiLock } from "react-icons/bi"
import { IonButton, IonIcon, IonText, IonTitle } from "@ionic/react"
import { personAdd } from 'ionicons/icons';
import { AddChannelMembers } from "../../channels";

export const ChannelHeader = () => {

    const { channelData, channelMembers } = useContext(ChannelContext)
    const pageRef = useRef()

    return (
        <IonTitle>
            <div className='flex items-center gap-2'>
                <div>
                    <div className='flex items-center'>
                        <div className='text-xl'>
                            {channelData?.type === 'Private' ? <BiLock /> : channelData?.type === 'Public' ? <BiHash /> : <BiGlobe />}
                        </div>
                        <h1 className='text-lg font-medium'>
                            {channelData?.channel_name}
                        </h1>
                    </div>
                    {channelData?.type !== "Open" && !channelData?.is_direct_message && !channelData?.is_self_message &&
                        <IonText color='medium' className='font-light text-sm'>
                            ({Object.keys(channelMembers).length} member{Object.keys(channelMembers).length > 1 ? 's' : ''})
                        </IonText>
                    }
                </div>
                {/* {channelData?.type !== "Open" && <IonButton fill="clear" size="small" color={'dark'} id='add-members'>
                    <IonIcon slot="icon-only" icon={personAdd}></IonIcon>
                </IonButton>} */}
            </div>
            {/* <AddChannelMembers presentingElement={pageRef.current} /> */}
        </IonTitle>
    )
}