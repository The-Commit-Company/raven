import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useContext, useMemo, useRef, useState } from "react"
import { ChannelMembers } from "./AddChannelMembers"
import { SquareAvatar } from "@/components/common/UserAvatar"
import { UserContext } from "@/utils/auth/UserProvider"

interface ViewChannelMembersProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string
}

export const ViewChannelMembers = ({ presentingElement, isOpen, onDismiss, channelID }: ViewChannelMembersProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const { currentUser } = useContext(UserContext)

    const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.api.chat.get_channel_members', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })

    const channelMembers = useMemo(() => {
        if (data?.message) {
            return Object.values(data.message)
        } else {
            return []
        }
    }, [data])

    const isCurrentUserAdmin = useMemo(() => {
        return channelMembers.find(member => member.name === currentUser)?.is_admin
    }, [channelMembers, currentUser])

    const [searchText, setSearchText] = useState('')

    const filteredUsers = useMemo(() => {
        return channelMembers.filter(member => {
            return member.name.toLowerCase().includes(searchText.toLowerCase())
        })
    }, [channelMembers, searchText])

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
                            <h1>Channel Members</h1>
                        </div>
                    </IonTitle>
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
                        <IonItemSliding key={user.name}>
                            <IonItem>
                                <div className='justify-between flex w-full py-2'>
                                    <div className='flex gap-4'>
                                        <SquareAvatar sizeClass='w-10 h-10' slot='start' alt={user.full_name} src={user.user_image} />
                                        <IonLabel>
                                            <h2>{user.full_name}</h2>
                                            <p>{user.name}</p>
                                        </IonLabel>
                                    </div>
                                    {user.is_admin ? <IonLabel color='medium'>admin</IonLabel> : null}
                                </div>
                            </IonItem>
                            {isCurrentUserAdmin && user.name !== currentUser && <IonItemOptions side="end">
                                <IonItemOption color="danger">Remove</IonItemOption>
                            </IonItemOptions>}
                        </IonItemSliding>
                    )) : <IonItem>
                        <IonLabel>No members found</IonLabel>
                    </IonItem>}
                </IonList>

            </IonContent>
        </IonModal>
    )
}