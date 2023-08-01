import { useRef, useContext } from 'react';
import {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonImg,
    IonSearchbar,
} from '@ionic/react';
import { BiGlobe, BiHash, BiLock } from 'react-icons/bi';
import { ChannelContext } from '../../../utils/channel/ChannelProvider';

export const AddChannelMembers = () => {

    const modal = useRef<HTMLIonModalElement>(null)

    function onDismiss() {
        modal.current?.dismiss()
    }

    const { channelData, users } = useContext(ChannelContext)

    console.log(users)

    return (
        <IonModal ref={modal} trigger="open-modal" initialBreakpoint={0.25} breakpoints={[0, 0.25, 0.5, 0.75]}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color="medium" onClick={() => onDismiss()}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        <div className='flex flex-col items-center justify-start'>
                            <h1>Add Members</h1>
                            <div className='flex items-center justify-start'>
                                {channelData?.type === 'Private' ? <BiLock /> : channelData?.type === "Public" ? <BiHash /> : <BiGlobe />}
                                <h1 className='ml-1'>
                                    {channelData?.channel_name}
                                </h1>
                            </div>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => console.log('Add clicked')} strong={true}>
                            Add
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonSearchbar onClick={() => modal.current?.setCurrentBreakpoint(0.75)} placeholder="Search"></IonSearchbar>
                <IonList>
                    <IonItem>
                        <IonAvatar slot="start">
                            <IonImg src="https://i.pravatar.cc/300?u=b" />
                        </IonAvatar>
                        <IonLabel>
                            <h2>Connor Smith</h2>
                            <p>Sales Rep</p>
                        </IonLabel>
                    </IonItem>
                    <IonItem>
                        <IonAvatar slot="start">
                            <IonImg src="https://i.pravatar.cc/300?u=a" />
                        </IonAvatar>
                        <IonLabel>
                            <h2>Daniel Smith</h2>
                            <p>Product Designer</p>
                        </IonLabel>
                    </IonItem>
                </IonList>
            </IonContent>
        </IonModal>
    )
}