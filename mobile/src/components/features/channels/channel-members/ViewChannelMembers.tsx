import { IonAlert, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonSearchbar, IonTitle, IonToolbar, ToastOptions, useIonToast } from "@ionic/react"
import { FrappeConfig, FrappeContext, useFrappeGetCall } from "frappe-react-sdk"
import { useContext, useMemo, useRef, useState } from "react"
import { ChannelMembers, Member } from "./AddChannelMembers"
import { SquareAvatar } from "@/components/common/UserAvatar"
import { UserContext } from "@/utils/auth/UserProvider"
import { ErrorBanner } from "@/components/layout"

interface ViewChannelMembersProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string
}

export const ViewChannelMembers = ({ presentingElement, isOpen, onDismiss, channelID }: ViewChannelMembersProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const { currentUser } = useContext(UserContext)

    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelMembers }>('raven.api.chat.get_channel_members', {
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
    const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined)

    const { call } = useContext(FrappeContext) as FrappeConfig

    const [present] = useIonToast()

    const presentToast = (message: string, color: ToastOptions['color']) => {
        present({
            message,
            duration: 1500,
            color,
            position: 'bottom',
        })
    }

    const removeMember = () => {
        return call.post('raven.api.raven_channel_member.remove_channel_member', {
            user_id: selectedMember?.name,
            channel_id: channelID
        }).then(() => {
            presentToast("Member removed successfully.", 'success')
            mutate()
        }).catch((e) => {
            presentToast("Error while removing member from channel.", 'danger')
        })
    }

    const filteredUsers = useMemo(() => {
        return channelMembers.filter(member => {
            return member.name.toLowerCase().includes(searchText.toLowerCase())
        })
    }, [channelMembers, searchText])

    const [isAlertOpen, setIsAlertOpen] = useState(false)

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

                <ErrorBanner error={error} />

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
                            {(isCurrentUserAdmin && user.name !== currentUser) ? <IonItemOptions
                                side="end"
                                onIonSwipe={() => {
                                    setSelectedMember(user)
                                    setIsAlertOpen(true)
                                }}>
                                <IonItemOption expandable
                                    color="danger"
                                    onClick={() => {
                                        setSelectedMember(user)
                                        setIsAlertOpen(true)
                                    }}>Remove</IonItemOption>
                            </IonItemOptions> : null}
                        </IonItemSliding>
                    )) : <IonItem><IonLabel>No members found</IonLabel></IonItem>}
                </IonList>

                <IonAlert onDidDismiss={() => setIsAlertOpen(false)} isOpen={isAlertOpen}
                    header="Remove Member"
                    message={`Are you sure you want to remove ${selectedMember?.full_name}?`}
                    buttons={[
                        {
                            text: 'No',
                            role: 'cancel',
                        }
                        , {
                            text: 'Yes',
                            role: 'destructive',
                            cssClass: 'text-danger',
                            handler: removeMember
                        }
                    ]} />
            </IonContent>
        </IonModal>
    )
}