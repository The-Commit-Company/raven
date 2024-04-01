import { FrappeError, useFrappeDocTypeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { UserContext } from "../auth/UserProvider";
import { ErrorBanner } from "@/components/layout";
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { FullPageLoader } from "@/components/layout/loaders";
import { RavenUser } from "@/types/Raven/RavenUser";


export const UserListContext = createContext<{ users: UserFields[], enabledUsers: UserFields[] }>({
    users: [],
    enabledUsers: []
})

export type UserFields = Pick<RavenUser, 'name' | 'full_name' | 'user_image' | 'first_name' | 'enabled' | 'type'>

/** Hook to fetch a list of users */
export const useUserList = () => {
    const userListContext = useContext(UserListContext)

    return userListContext
}
export const UserListProvider = ({ children }: PropsWithChildren) => {

    const { isLoggedIn } = useContext(UserContext)
    const { data, error: usersError, isLoading, mutate } = useFrappeGetCall<{ message: UserFields[] }>('raven.api.raven_users.get_list', undefined, isLoggedIn ? 'raven.api.raven_users.get_list' : null, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        errorRetryCount: 10
    })

    useFrappeDocTypeEventListener('User', () => mutate())

    const { users, enabledUsers } = useMemo(() => {
        return {
            users: data?.message ?? [],
            enabledUsers: data?.message?.filter(user => user.enabled === 1) ?? []
        }
    }, [data])

    if (isLoading) {
        return <FullPageLoader />
    }
    if (usersError) {
        return <ErrorPage error={usersError} mutate={mutate} />
    }

    return <UserListContext.Provider value={{ users, enabledUsers }}>
        {children}
    </UserListContext.Provider>

}

const ErrorPage = ({ error, mutate }: { error: FrappeError, mutate: VoidFunction }) => {

    return <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Error: Failed to load users</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <ErrorBanner error={error} />
        </IonContent>
        <IonFooter>
            <IonToolbar>
                <IonButtons slot='end'>
                    <IonButton onClick={() => mutate()}>
                        Reload
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonFooter>
    </IonPage>
}