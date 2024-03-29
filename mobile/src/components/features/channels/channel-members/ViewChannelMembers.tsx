import { IonAlert, IonContent, IonHeader, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonSearchbar, ToastOptions, useIonToast } from "@ionic/react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext, useMemo, useRef, useState } from "react"
import { Member } from "./AddChannelMembers"
import { UserContext } from "@/utils/auth/UserProvider"
import { ErrorBanner } from "@/components/layout"
import { useGetChannelMembers } from "@/hooks/useGetChannelMembers"
import { Button } from "@/components/ui/button"
import { CustomAvatar } from "@/components/ui/avatar"
import { BiSolidCrown } from "react-icons/bi"

interface ViewChannelMembersProps {
    presentingElement: HTMLElement | undefined,
    isOpen: boolean,
    onDismiss: VoidFunction,
    channelID: string,
}

export const ViewChannelMembers = ({ presentingElement, isOpen, onDismiss, channelID }: ViewChannelMembersProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const { currentUser } = useContext(UserContext)

    const { channelMembers, mutate, error } = useGetChannelMembers(channelID)

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
                <div className='py-2 inset-x-0 top-0 overflow-hidden items-center min-h-5 bg-background border-b-foreground/10 border-b'>
                    <div className='flex items-center'>
                        <div className="flex flex-1">
                            <Button variant="ghost" className="hover:bg-transparent hover:text-foreground/80" onClick={() => onDismiss()}>
                                Cancel
                            </Button>
                        </div>
                        <div className="flex flex-auto">
                            <span className="text-base font-medium">Channel Members</span>
                        </div>
                    </div>
                </div>
            </IonHeader>

            <IonContent>
                <IonSearchbar
                    placeholder="Search"
                    autocapitalize="off"
                    debounce={1000}
                    onIonInput={(e) => setSearchText(e.target.value?.toString() || '')}
                />

                <ErrorBanner error={error} />

                <IonList>
                    {filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <IonItemSliding key={user.name}>
                            <IonItem>
                                <div className='flex justify-between items-center w-full py-2'>
                                    <div className='flex items-center gap-4'>
                                        <CustomAvatar alt={user.full_name} src={user.user_image} sizeClass='w-10 h-10'/>
                                        <div className='flex flex-col text-ellipsis leading-tight'>
                                            <span>{user.full_name}</span>
                                            <span className='text-foreground/40 text-sm'>{user.name}</span>
                                        </div>
                                    </div>
                                    {user.is_admin ? <BiSolidCrown color='#FFC53D'/> : null}
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