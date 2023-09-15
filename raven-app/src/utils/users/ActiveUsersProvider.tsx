import { useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext } from "react";

export const ActiveUsersContext = createContext<string[]>([])

export const ActiveUsersProvider = ({ children }: PropsWithChildren) => {

    const { data, mutate } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users')

    useFrappeEventListener('raven:user_active_state_updated', (data) => {
        mutate()
    })

    return <ActiveUsersContext.Provider value={data?.message ?? []}>
        {children}
    </ActiveUsersContext.Provider>
}