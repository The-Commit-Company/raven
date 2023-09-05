import { useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext, useContext } from "react";
import { UserContext } from "../auth/UserProvider";

export const ActiveUsersContext = createContext<string[]>([])

export const ActiveUsersProvider = ({ children }: PropsWithChildren) => {

    const { isLoggedIn } = useContext(UserContext)
    const { data } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users', undefined,
        isLoggedIn ? undefined : null)

    return <ActiveUsersContext.Provider value={data?.message ?? []}>
        {children}
    </ActiveUsersContext.Provider>
}