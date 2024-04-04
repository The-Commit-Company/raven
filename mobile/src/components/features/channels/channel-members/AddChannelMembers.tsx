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
import { useGetChannelMembers } from '@/hooks/useGetChannelMembers';
import { Badge, Button, Text, Theme } from '@radix-ui/themes';
import { UserAvatar } from '@/components/common/UserAvatar';

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
                <Theme accentColor="iris">
                    <div className='py-3 flex justify-between px-4 inset-x-0 top-0 overflow-hidden items-center border-b-gray-4 border-b rounded-t-3xl'>
                        <div className="w-11">
                            <Button
                                size='3' variant="ghost" color='gray' onClick={() => onDismiss()}>
                                Cancel
                            </Button>
                        </div>
                        <Text className="cal-sans font-medium" size='4'>Add Members</Text>
                        <div>
                            <Button
                                variant="ghost"
                                size='3'
                                onClick={addMembers}
                                type='submit'
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </Theme>

            </IonHeader>

            <IonContent>
                <IonSearchbar
                    placeholder="Search"
                    debounce={250}
                    value={searchText}
                    onIonInput={(e) => setSearchText(e.detail.value?.toString() || '')}
                />
                <Theme accentColor="iris">


                    <IonList>
                        {filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <IonItem key={user.name}>
                                {channelMembers.some((member) => member.name === user.name) ? (
                                    // User is already a channel member
                                    <div className='justify-between items-center flex w-full py-2'>
                                        <div className='flex items-center gap-4'>
                                            <UserAvatar alt={user.full_name} src={user.user_image} isBot={user.type === 'Bot'} size='3' />
                                            <div className='flex flex-col text-ellipsis leading-tight'>
                                                <Text as='span' weight='medium'>{user.full_name}</Text>
                                                <Text as='span' size='2' color='gray'>{user.name}</Text>
                                            </div>
                                        </div>
                                        <Badge color='gray' size='1'>Added</Badge>
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
                                            <UserAvatar alt={user.full_name} src={user.user_image} isBot={user.type === 'Bot'} size='3' />
                                            <div className='flex flex-col text-ellipsis leading-tight'>
                                                <Text as='span' weight='medium'>{user.full_name}</Text>
                                                <Text as='span' size='2' color='gray'>{user.name}</Text>
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
                </Theme>
            </IonContent>
        </IonModal>
    )
}