import { UserFields } from "@raven/types/common/UserFields";
import { useFrappeDocTypeEventListener, useFrappeGetCall, useSWRConfig } from "frappe-react-sdk";
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";

export const UserListContext = createContext<{ users: Map<string, UserFields>, enabledUsers: Map<string, UserFields> }>({
    users: new Map<string, UserFields>(),
    enabledUsers: new Map<string, UserFields>()
})

export type UserListProviderProps = PropsWithChildren & {
    loadingRenderer?: React.ReactNode
    errorRenderer?: React.ReactNode
}

/**
 * This hook is used to get the user list and returns an object with users and enabled users in a Map.
 * This is only supposed to be called once in the app since it also has realtime event listeners to update the user list.
 * 
 * Use this in conjunction with the UserListContext
 */
export const useUserListProvider = () => {
    const { mutate: globalMutate } = useSWRConfig()
    const { data, mutate, ...rest } = useFrappeGetCall<{ message: UserFields[] }>('raven.api.raven_users.get_list', undefined, 'raven.api.raven_users.get_list', {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(false)

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined
        if (newUpdatesAvailable) {
            timeout = setTimeout(() => {
                mutate()
                // Mutate the channel list as well
                globalMutate(`channel_list`)
                setNewUpdatesAvailable(false)
            }, 1000) // 1 second
        }
        return () => clearTimeout(timeout)
    }, [newUpdatesAvailable])

    /** 
     * If a bulk import happens, this gets called multiple times potentially causing the server to go down.
     * Instead, throttle this - wait for all events to subside
     */
    useFrappeDocTypeEventListener('Raven User', () => {
        setNewUpdatesAvailable(true)
    })

    const { users, enabledUsers } = useMemo(() => {

        const users = new Map<string, UserFields>()
        const enabledUsers = new Map<string, UserFields>()

        data?.message?.forEach(user => {
            users.set(user.name, user)
            if (user.enabled === 1) {
                enabledUsers.set(user.name, user)
            }
        })

        return {
            users,
            enabledUsers
        }
    }, [data])

    return {
        hasData: !!data,
        users,
        enabledUsers,
        mutate,
        ...rest
    }
}