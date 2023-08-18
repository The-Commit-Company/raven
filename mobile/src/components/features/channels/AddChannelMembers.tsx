import { useRef, useContext, useMemo } from 'react';
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
    IonSearchbar,
    IonListHeader,
    IonCheckbox,
} from '@ionic/react';
import { BiGlobe, BiHash, BiLock } from 'react-icons/bi';
import { ChannelContext } from '../../../utils/channel/ChannelProvider';
import Avatar from 'react-avatar';

interface AddChannelMembersProps {
    presentingElement: HTMLElement | undefined
}

export const AddChannelMembers = ({ presentingElement }: AddChannelMembersProps) => {

    const modal = useRef<HTMLIonModalElement>(null)

    function onDismiss() {
        modal.current?.dismiss()
    }

    const { channelData, channelMembers, users } = useContext(ChannelContext)

    const existingMembers = useMemo(() => {
        return Object.keys(channelMembers).map(userId => users[userId])
    }, [channelMembers, users])

    const nonMembers = useMemo(() => {
        return Object.keys(users)
            .filter(userId => !channelMembers || !(userId in channelMembers))
            .map(userId => users[userId])
    }, [users, channelMembers])

    return (
        <IonModal ref={modal} presentingElement={presentingElement} trigger="add-members">
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
                            <div className='flex items-center justify-start mt-1 text-gray-400'>
                                {channelData?.type === 'Private' ? <BiLock /> : channelData?.type === "Public" ? <BiHash /> : <BiGlobe />}
                                <p className='text-sm font-medium'>{channelData?.channel_name}</p>
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
                <IonSearchbar placeholder="Search" debounce={1000} onIonInput={() => { }}></IonSearchbar>
                <IonList>
                    <IonListHeader>
                        <IonLabel>Members</IonLabel>
                    </IonListHeader>
                    {existingMembers.map((member) => (
                        <IonItem key={member.name}>
                            <div className='flex gap-4'>
                                {member.user_image ?
                                    <IonAvatar slot="start" className="h-10 w-10">
                                        <img src={member.user_image} />
                                    </IonAvatar>
                                    :
                                    <Avatar name={member.full_name} round size='40' />}
                                <IonLabel>
                                    <h2>{member.full_name}</h2>
                                    <p>{member.name}</p>
                                </IonLabel>
                            </div>
                        </IonItem>
                    ))}
                </IonList>
                <IonList>
                    <IonListHeader>
                        <IonLabel>Non-Members</IonLabel>
                    </IonListHeader>
                    {nonMembers.map((user) => (
                        <IonItem key={user.name}>
                            <IonCheckbox justify="space-between">
                                <div className='flex gap-4'>
                                    {user.user_image ?
                                        <IonAvatar slot="start" className="h-10 w-10">
                                            <img src={user.user_image} />
                                        </IonAvatar>
                                        :
                                        <Avatar name={user.full_name} round size='40' />}
                                    <IonLabel>
                                        <h2>{user.full_name}</h2>
                                        <p>{user.name}</p>
                                    </IonLabel>
                                </div>
                            </IonCheckbox>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonModal>
    )
}