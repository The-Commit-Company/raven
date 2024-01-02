import { IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react"
import { PrivateMessages } from "../../components/features/direct-messages"
import { useMemo, useState } from "react"
import { UserFields, useUserList } from "@/utils/users/UserListProvider"
import { DMChannelListItem, UnreadCountData, useChannelList } from "@/utils/channel/ChannelListProvider"
import { ChannelListLoader } from "@/components/layout/loaders"
import { ErrorBanner } from "@/components/layout"
import { useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk"

export interface DMUser extends UserFields {
    channel?: DMChannelListItem,
}
export const DirectMessageList = () => {

    const [searchInput, setSearchInput] = useState('')

    const { users, isLoading, error } = useMessageUsersList()

    const filteredUsers: DMUser[] = useMemo(() => {
        if (!users) return []
        const searchTerm = searchInput.toLowerCase()
        if (!searchTerm) return users
        return users.filter(user => user.full_name.toLowerCase().includes(searchTerm))
    }, [users, searchInput])

    const { data: unread_count, mutate: update_count } = useFrappeGetCall<{ message: UnreadCountData }>("raven.raven_messaging.doctype.raven_message.raven_message.get_unread_count_for_channels",
        undefined,
        'unread_channel_count', {
        // revalidateOnFocus: false,
    })
    useFrappeEventListener('raven:unread_channel_count_updated', () => {
        update_count()
    })

    return (
        <IonPage>
            <IonHeader>
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
                        onIonInput={(e) => setSearchInput(e.detail.value!)}>
                    </IonSearchbar>
                </IonToolbar>
                {isLoading && <ChannelListLoader />}
                {error && <ErrorBanner error={error} />}
                <PrivateMessages users={filteredUsers} unread_count={unread_count?.message}/>
            </IonContent>
        </IonPage>
    )
}

const useMessageUsersList = () => {
    //Users list gives us the list of users with the "Raven User" role
    const { users } = useUserList()

    //Channel list gives us the list of DM channels for this user
    const { dm_channels, isLoading, error } = useChannelList()
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

    return {
        users: allUsers,
        isLoading,
        error
    }
}