import { Flex, Box } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { hasRavenUserRole } from '@/utils/roles'
import { FullPageLoader } from '@/components/layout/Loaders/FullPageLoader'
import CommandMenu from '@/components/feature/CommandMenu/CommandMenu'
import { useFetchActiveUsersRealtime } from '@/hooks/fetchers/useFetchActiveUsers'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { showNotification } from '@/utils/pushNotifications'
import MessageActionController from '@/components/feature/message-actions/MessageActionController'

const AddRavenUsersPage = lazy(() => import('@/pages/AddRavenUsersPage'))

export const MainPage = () => {

    const isRavenUser = hasRavenUserRole()

    if (isRavenUser) {
        return (
            <MainPageContent />
        )
    } else {
        // If the user does not have the Raven User role, then show an error message if the user cannot add more people.
        // Else, show the page to add people to Raven
        return <Suspense fallback={<FullPageLoader />}>
            <AddRavenUsersPage />
        </Suspense>
    }

}

const MainPageContent = () => {

    useFetchActiveUsersRealtime()

    useEffect(() => {
        //@ts-expect-error
        window?.frappePushNotification?.onMessage((payload) => {
            showNotification(payload)
        })
    }, [])

    const isMobile = useIsMobile()

    return <UserListProvider>
        <ChannelListProvider>
            <Flex>
                {!isMobile &&
                    <Box className={`w-80 bg-gray-2 border-r-gray-3 border-r dark:bg-gray-1`} left="0" top='0' position="fixed">
                        <Sidebar />
                    </Box>
                }
                <Box className='md:ml-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width)-0rem)] dark:bg-gray-2'>
                    <Outlet />
                </Box>
            </Flex>
            <CommandMenu />
            <MessageActionController />
        </ChannelListProvider>
    </UserListProvider>
}