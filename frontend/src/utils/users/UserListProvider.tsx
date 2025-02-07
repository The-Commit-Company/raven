import { useFrappeDocTypeEventListener, useFrappeGetCall, useSWRConfig } from "frappe-react-sdk";
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner";
import { Box, Flex, Link, Text } from "@radix-ui/themes";
import { RavenUser } from "@/types/Raven/RavenUser";
import { Stack } from "@/components/layout/Stack";


export const UserListContext = createContext<{ users: UserFields[], enabledUsers: UserFields[] }>({
    users: [],
    enabledUsers: []
})

export type UserFields = Pick<RavenUser, 'name' | 'full_name' | 'user_image' | 'first_name' | 'enabled' | 'type' | 'availability_status' | 'custom_status'>

export const UserListProvider = ({ children }: PropsWithChildren) => {


    const { mutate: globalMutate } = useSWRConfig()
    const { data, error: usersError, mutate, isLoading } = useFrappeGetCall<{ message: UserFields[] }>('raven.api.raven_users.get_list', undefined, 'raven.api.raven_users.get_list', {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    })

    const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(0)

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined
        if (newUpdatesAvailable) {
            timeout = setTimeout(() => {
                mutate()
                // Mutate the channel list as well
                globalMutate(`channel_list`)
                setNewUpdatesAvailable(0)
            }, 1000) // 1 second
        }
        return () => clearTimeout(timeout)
    }, [newUpdatesAvailable])

    /** 
     * If a bulk import happens, this gets called multiple times potentially causing the server to go down.
     * Instead, throttle this - wait for all events to subside
     */
    useFrappeDocTypeEventListener('Raven User', () => {
        setNewUpdatesAvailable((n) => n + 1)
    })

    const { users, enabledUsers } = useMemo(() => {
        return {
            users: data?.message ?? [],
            enabledUsers: data?.message?.filter(user => user.enabled === 1) ?? []
        }
    }, [data])

    if (isLoading) {
        return <Flex justify='center' align='center' height='100vh' width='100vw' className='animate-fadein'>
            <Stack className='text-center' gap='1'>
                <Text size='7' className='cal-sans tracking-normal'>raven</Text>
                <Text color='gray' weight='medium'>Setting up your workspace...</Text>
            </Stack>
        </Flex>
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

    return <UserListContext.Provider value={{ users, enabledUsers }}>
        {children}
    </UserListContext.Provider>
}