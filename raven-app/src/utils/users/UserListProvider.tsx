import { useFrappeDocTypeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext } from "react";
import { User } from "../../../../types/Core/User";
import { ErrorBanner } from "@/components/layout/AlertBanner";
import { FullPageLoader } from "@/components/layout/Loaders";
import { Box, Flex, Link } from "@radix-ui/themes";


export const UserListContext = createContext<{ users: UserFields[] }>({
    users: []
})

export type UserFields = Pick<User, 'name' | 'full_name' | 'user_image' | 'first_name'>

export const UserListProvider = ({ children }: PropsWithChildren) => {


    const { data, error: usersError, mutate, isLoading } = useFrappeGetCall<{ message: UserFields[] }>('raven.api.raven_users.get_list', undefined, 'raven.api.raven_users.get_list', {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    useFrappeDocTypeEventListener('User', () => mutate())

    if (isLoading) {
        return <FullPageLoader />
    }
    if (usersError) {
        return <Flex align='center' justify='center' px='4' mx='auto' className="w-[50vw] h-screen">
            <ErrorBanner error={usersError}>
                <Box py='2'>
                    <Link href={'/app/raven-user'}>View Raven Users</Link>
                </Box>
            </ErrorBanner>
        </Flex>
    }

    return <UserListContext.Provider value={{ users: data?.message ?? [] }}>
        {children}
    </UserListContext.Provider>
}