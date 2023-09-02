import { useFrappeDocTypeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext } from "react";
import { User } from "../../../../types/Core/User";
import { Box, Center } from "@chakra-ui/react";
import { ErrorBanner } from "@/components/layout/AlertBanner";


export const UserListContext = createContext<{ users: UserFields[] }>({
    users: []
})

export type UserFields = Pick<User, 'name' | 'full_name' | 'user_image' | 'first_name'>

export const UserListProvider = ({ children }: PropsWithChildren) => {

    const { data, error: usersError, mutate } = useFrappeGetCall<{ message: UserFields[] }>('raven.api.raven_users.get_list', undefined, undefined, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    useFrappeDocTypeEventListener('User', () => mutate())

    if (usersError) {
        return <Center px='4' w='100vw' h='100vh'>
            <ErrorBanner error={usersError} />
        </Center>
    }

    return <UserListContext.Provider value={{ users: data?.message ?? [] }}>
        {children}
    </UserListContext.Provider>
}