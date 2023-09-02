import { IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react"
import { PrivateMessages } from "../../components/features/direct-messages"
import { useMemo, useState } from "react"
import { UserFields, useUserList } from "@/utils/users/UserListProvider"
import { DMChannelListItem, useChannelList } from "@/utils/channel/ChannelListProvider"

export interface DMUser extends UserFields {
    channel?: DMChannelListItem,
}
export const DirectMessageList = () => {

    const [searchInput, setSearchInput] = useState('')

    const users = useMessageUsersList()

    const filteredUsers: DMUser[] = useMemo(() => {
        if (!users) return []
        const searchTerm = searchInput.toLowerCase()
        if (!searchTerm) return users
        return users.filter(user => user.full_name.toLowerCase().includes(searchTerm))
    }, [users, searchInput])

    return (
        <IonPage>
            <IonHeader translucent>
                <IonToolbar>
                    <IonTitle>Direct Messages</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense" translucent>
                    <IonToolbar>
                        <IonTitle size="large">Messages</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonToolbar>
                    <IonSearchbar
                        spellCheck
                        onIonInput={(e) => setSearchInput(e.detail.value!)}
                    >
                    </IonSearchbar>
                </IonToolbar>
                <PrivateMessages users={filteredUsers} />
            </IonContent>
        </IonPage>
    )
}

const useMessageUsersList = () => {
    //Users list gives us the list of users with the "Raven User" role
    const { users } = useUserList()

    //Channel list gives us the list of DM channels for this user
    const { dm_channels } = useChannelList()
    const allUsers: DMUser[] = useMemo(() => {
        if (!users) return []
        return users.map(user => {
            const corresponding_dm_channel: DMChannelListItem | undefined = dm_channels?.find(channel => channel.peer_user_id === user.name)
            return {
                ...user,
                channel: corresponding_dm_channel
            }
        })
    }, [users, dm_channels])

    return allUsers
}