import { FrappeError, useFrappeDocTypeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext, useContext } from "react";
import { User } from "../../../../types/Core/User";
import { UserContext } from "../auth/UserProvider";
import { ErrorBanner, FullPageLoader } from "@/components/layout";
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";


export const UserListContext = createContext<{ users: UserFields[] }>({
    users: []
})

export type UserFields = Pick<User, 'name' | 'full_name' | 'user_image' | 'first_name'>

/** Hook to fetch a list of users */
export const useUserList = () => {
    const userListContext = useContext(UserListContext)

    return userListContext
}
export const UserListProvider = ({ children }: PropsWithChildren) => {

    const { isLoggedIn } = useContext(UserContext)
    const { data, error: usersError, isLoading, mutate } = useFrappeGetCall<{ message: UserFields[] }>('raven.api.raven_users.get_list', undefined, isLoggedIn ? undefined : null, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        errorRetryCount: 10
    })

    useFrappeDocTypeEventListener('User', () => mutate())

    if (isLoading) {
        return <FullPageLoader />
    }
    if (usersError) {
        return <ErrorPage error={usersError} mutate={mutate} />
    }

    return <UserListContext.Provider value={{ users: data?.message ?? [] }}>
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