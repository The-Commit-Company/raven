import { useRef, useMemo, useState, useContext } from 'react';
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
import Avatar from 'react-avatar';
import { ChannelContext } from '../../../utils/channel/ChannelProvider';

interface AddChannelMembersProps {
    presentingElement: HTMLElement | undefined
}

export const AddChannelMembers = ({ presentingElement }: AddChannelMembersProps) => {

    const modal = useRef<HTMLIonModalElement>(null)

    const { channelData, channelMembers, users } = useContext(ChannelContext)

    function onDismiss() {
        modal.current?.dismiss()
    }

    const existingMembers = useMemo(() => {
        return Object.keys(channelMembers).map(userId => users[userId])
    }, [channelMembers, users])

    const nonMembers = useMemo(() => {
        return Object.keys(users)
            .filter(userId => !channelMembers || !(userId in channelMembers))
            .map(userId => users[userId])
    }, [users, channelMembers])

    const [searchText, setSearchText] = useState('')

    const filteredMembers = useMemo(() => {
        return existingMembers.filter(member => {
            return member.name.toLowerCase().includes(searchText.toLowerCase())
        })
    }, [existingMembers, searchText])

    const filteredNonMembers = useMemo(() => {
        return nonMembers.filter(member => {
            return member.name.toLowerCase().includes(searchText.toLowerCase())
        })
    }, [nonMembers, searchText])

    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const addMembers = () => {
        console.log('Add members', selectedMembers)
    }

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
                        <IonButton onClick={addMembers} strong={true}>
                            Add
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonSearchbar
                    placeholder="Search"
                    debounce={1000}
                    onIonInput={(e) => setSearchText(e.target.value?.toString() || '')}
                />
                <IonList>
                    <IonListHeader>
                        <IonLabel>Members</IonLabel>
                    </IonListHeader>
                    {filteredMembers && filteredMembers.length > 0 ? filteredMembers.map((member) => (
                        <IonItem key={member.name}>
                            <div className='flex gap-4 p-2'>
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
                    )) : (
                        <IonItem>
                            <IonLabel>
                                <h3 className='text-gray-400'>No users found</h3>
                            </IonLabel>
                        </IonItem>
                    )}
                </IonList>
                <IonList>
                    <IonListHeader>
                        <IonLabel>Non-Members</IonLabel>
                    </IonListHeader>
                    {filteredNonMembers && filteredNonMembers.length > 0 ? filteredNonMembers.map((user) => (
                        <IonItem key={user.name}>
                            <IonCheckbox
                                justify="space-between"
                                checked={selectedMembers.includes(user.name)}
                                onIonChange={({ detail: { checked } }) => {
                                    if (checked) {
                                        setSelectedMembers([...selectedMembers, user.name])
                                    } else {
                                        setSelectedMembers(selectedMembers.filter(id => id !== user.name))
                                    }
                                }}>
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
                    )) : (
                        <IonItem>
                            <IonLabel>
                                <h3 className='text-gray-400'>No users found</h3>
                            </IonLabel>
                        </IonItem>
                    )}
                </IonList>
            </IonContent>
        </IonModal>
    )
}