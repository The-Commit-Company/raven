import { useContext, useMemo, useRef, useState } from 'react';
import {
    IonModal,
    IonHeader,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonCheckbox,
    useIonToast,
    ToastOptions,
} from '@ionic/react';
import { useFrappeCreateDoc } from 'frappe-react-sdk';
import { UserListContext } from '@/utils/users/UserListProvider';
import { Button } from '@/components/ui/button';
import { useGetChannelMembers } from '@/hooks/useGetChannelMembers';
import { CustomAvatar } from '@/components/ui/avatar';

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

    const { channelMembers, mutate, error } = useGetChannelMembers(channelID)
    const { createDoc, error: errorAddingMembers, loading: addingMembers } = useFrappeCreateDoc()

    const users = useContext(UserListContext)

    const [searchText, setSearchText] = useState('')

    const filteredUsers = useMemo(() => {
        return users.enabledUsers.filter(member => {
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
                <div className='py-2 inset-x-0 top-0 overflow-hidden items-center min-h-5 bg-background border-b-foreground/10 border-b'>
                    <div className='flex gap-4 items-center justify-around'>
                        <div>
                            <Button variant="ghost" className="hover:bg-transparent hover:text-foreground/80" onClick={() => onDismiss()}>
                                Cancel
                            </Button>
                        </div>
                        <span className="text-base font-medium">Add Members</span>
                        <div>
                            <Button variant="ghost" className="text-primary hover:bg-transparent" onClick={addMembers}>Add</Button>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent>

                <IonSearchbar
                    placeholder="Search"
                    debounce={1000}
                    autocapitalize='off'
                    onIonInput={(e) => setSearchText(e.target.value?.toString() || '')}
                />

                <IonList>
                    {filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <IonItem key={user.name}>
                            {channelMembers.some((member) => member.name === user.name) ? (
                                // User is already a channel member
                                <div className='justify-between flex w-full py-2'>
                                    <div className='flex items-center gap-4'>
                                        <CustomAvatar alt={user.full_name} src={user.user_image} sizeClass='w-10 h-10'/>
                                        <div className='flex flex-col text-ellipsis leading-tight'>
                                            <span>{user.full_name}</span>
                                            <span className='text-foreground/40 text-sm'>{user.name}</span>
                                        </div>
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
                                    <div className='flex items-center gap-4'>
                                        <CustomAvatar alt={user.full_name} src={user.user_image} sizeClass='w-10 h-10'/>
                                        <div className='flex flex-col text-ellipsis leading-tight'>
                                            <span>{user.full_name}</span>
                                            <span className='text-foreground/40 text-sm'>{user.name}</span>
                                        </div>
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