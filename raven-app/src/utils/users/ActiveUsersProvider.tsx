import { useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext } from "react";

export const ActiveUsersContext = createContext<string[]>([])

export const ActiveUsersProvider = ({ children }: PropsWithChildren) => {

    const { data } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users')

    return <ActiveUsersContext.Provider value={data?.message ?? []}>
        {children}
    </ActiveUsersContext.Provider>
}