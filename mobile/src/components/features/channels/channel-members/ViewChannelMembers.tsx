import { IonAlert, IonContent, IonHeader, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonSearchbar, ToastOptions, useIonToast } from "@ionic/react"
import { FrappeConfig, FrappeContext } from "frappe-react-sdk"
import { useContext, useMemo, useRef, useState } from "react"
import { Member } from "./AddChannelMembers"
import { UserContext } from "@/utils/auth/UserProvider"
import { ErrorBanner } from "@/components/layout"
import { useGetChannelMembers } from "@/hooks/useGetChannelMembers"
import { BiSolidCrown } from "react-icons/bi"
import { UserAvatar } from "@/components/common/UserAvatar"
import { Button, Text, Theme } from "@radix-ui/themes"

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

    const removeMember = async () => {
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
                <Theme accentColor="iris">
                    <div className='py-3 flex justify-between px-4 inset-x-0 top-0 overflow-hidden items-center border-b-gray-4 border-b rounded-t-3xl'>
                        <div className="w-11">
                            <Button
                                size='3' variant="ghost" color='gray' onClick={() => onDismiss()}>
                                Close
                            </Button>
                        </div>
                        <Text className="cal-sans font-medium" size='4'>Members</Text>
                        <div className="w-11">

                        </div>
                    </div>
                </Theme>
            </IonHeader>

            <IonContent>
                <IonSearchbar
                    placeholder="Search"
                    autocapitalize="off"
                    debounce={250}
                    onIonInput={(e) => setSearchText(e.target.value?.toString() || '')}
                />

                <Theme accentColor="iris">

                    <ErrorBanner error={error} />
                    <IonList>
                        {filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <IonItemSliding key={user.name}>
                                <IonItem>
                                    <div className='justify-between items-center flex w-full py-2'>
                                        <div className='flex items-center gap-4'>
                                            <UserAvatar size='3' alt={user.full_name} src={user.user_image} isBot={user.type === "Bot"} />
                                            <div className='flex flex-col text-ellipsis leading-tight'>
                                                <Text as='span' weight='medium'>{user.full_name}</Text>
                                                {user.type !== "Bot" &&
                                                    <Text as='span' size='2' color='gray'>{user.name}</Text>
                                                }
                                            </div>
                                        </div>
                                        {user.is_admin ? <BiSolidCrown color='#FFC53D' /> : null}
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
                </Theme>
            </IonContent>
        </IonModal>
    )
}