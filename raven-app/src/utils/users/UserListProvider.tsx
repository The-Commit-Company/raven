import { useFrappeDocTypeEventListener, useFrappeGetCall } from "frappe-react-sdk";
import { PropsWithChildren, createContext } from "react";
import { User } from "../../../../types/Core/User";
import { Box, Button, Center } from "@chakra-ui/react";
import { ErrorBanner } from "@/components/layout/AlertBanner";
import { FullPageLoader } from "@/components/layout/Loaders";
import { ChevronRight } from "lucide-react";


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
        return <Center px='4' mx='auto' w='50vw' h='100vh'>
            <ErrorBanner error={usersError} status="info">
                <Box>
                    <Button colorScheme='blue' size='xs' as={'a'} href={'/app/raven-user'} rightIcon={<ChevronRight />}>View Raven Users</Button>
                </Box>
            </ErrorBanner>
        </Center>
    }

    return <UserListContext.Provider value={{ users: data?.message ?? [] }}>
        {children}
    </UserListContext.Provider>
}