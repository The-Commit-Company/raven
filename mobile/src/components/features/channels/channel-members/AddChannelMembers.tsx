import { useContext, useMemo, useRef, useState } from 'react';
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
    IonSearchbar,
    IonCheckbox,
    useIonToast,
    ToastOptions,
} from '@ionic/react';
import { useFrappeCreateDoc, useFrappeGetCall } from 'frappe-react-sdk';
import { UserListContext } from '@/utils/users/UserListProvider';
import { SquareAvatar } from '@/components/common/UserAvatar';

interface AddChannelMembersProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string
}

export type Member = {
    name: string
    full_name: string
    user_image: string | undefined
    first_name: string
    is_admin?: boolean
}

export type ChannelMembers = {
    [name: string]: Member
}

export const AddChannelMembers = ({ presentingElement, isOpen, onDismiss, channelID }: AddChannelMembersProps) => {

    const modal = useRef<HTMLIonModalElement>(null)

    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.api.chat.get_channel_members', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })
    const { createDoc, error: errorAddingMembers, loading: addingMembers } = useFrappeCreateDoc()

    const users = useContext(UserListContext)

    const channelMembers = useMemo(() => {
        if (data?.message) {
            return Object.values(data.message)
        } else {
            return []
        }
    }, [data])

    const [searchText, setSearchText] = useState('')

    const filteredUsers = useMemo(() => {
        return users.users.filter(member => {
            return member.name.toLowerCase().includes(searchText.toLowerCase())
        })
    }, [users, searchText])

    const [selectedMembers, setSelectedMembers] = useState<string[]>([])

    const [present] = useIonToast()

    const presentToast = (message: string, color: ToastOptions['color']) => {
        present({
            message,
            duration: 1500,
            color,
            position: 'bottom',
        })
    }

    const addMembers = () => {
        if (selectedMembers && selectedMembers.length > 0) {
            const promises = selectedMembers.map(async (member) => {
                return createDoc('Raven Channel Member', {
                    channel_id: channelID,
                    user_id: member
                })
            })
            Promise.all(promises)
                .then(() => {
                    presentToast("Member added successfully.", 'success')
                    mutate()
                    onDismiss()
                }).catch((e) => {
                    presentToast("Error while adding member to the channel.", 'danger')
                })
        }
    }

    return (
        <IonModal ref={modal} onDidDismiss={onDismiss} isOpen={isOpen} presentingElement={presentingElement}>

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
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={addMembers} strong={true}>
                            Add
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>

                <IonSearchbar
                    placeholder="Search"
                    debounce={1000}
                    onIonInput={(e) => setSearchText(e.target.value?.toString() || '')}
                />

                <IonList>
                    {filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <IonItem key={user.name}>
                            {channelMembers.some((member) => member.name === user.name) ? (
                                // User is already a channel member
                                <div className='justify-between flex w-full py-2'>
                                    <div className='flex gap-4'>
                                        <SquareAvatar sizeClass='w-10 h-10' slot='start' alt={user.full_name} src={user.user_image} />
                                        <IonLabel>
                                            <h2>{user.full_name}</h2>
                                            <p>{user.name}</p>
                                        </IonLabel>
                                    </div>
                                    <IonLabel color='medium'>added</IonLabel>
                                </div>
                            ) : (
                                // User is not a channel member, show a checkbox for adding them
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
                                        <SquareAvatar sizeClass='w-10 h-10' slot='start' alt={user.full_name} src={user.user_image} />
                                        <IonLabel>
                                            <h2>{user.full_name}</h2>
                                            <p>{user.name}</p>
                                        </IonLabel>
                                    </div>
                                </IonCheckbox>
                            )}
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