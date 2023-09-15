import { useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext, useContext, useEffect } from "react";
import { UserContext } from "../auth/UserProvider";
export const ActiveUsersContext = createContext<string[]>([])

export const ActiveUsersProvider = ({ children }: PropsWithChildren) => {

    const { isLoggedIn } = useContext(UserContext)
    const { data, mutate } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users', undefined,
        isLoggedIn ? 'active_users' : null, {
        keepPreviousData: true
    })

    useFrappeEventListener('raven:user_active_state_updated', (data) => {
        mutate()
    })
    return <ActiveUsersContext.Provider value={data?.message ?? []}>
        {children}
    </ActiveUsersContext.Provider>
}