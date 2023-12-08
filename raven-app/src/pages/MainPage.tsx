import { Flex, Box } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { VirtuosoRefProvider } from '../utils/message/VirtuosoRefProvider'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { ActiveUsersProvider } from '@/utils/users/ActiveUsersProvider'
import { hasRavenUserRole } from '@/utils/roles'
import { FullPageLoader } from '@/components/layout/Loaders'
const AddRavenUsersPage = lazy(() => import('@/pages/AddRavenUsersPage'))

export const MainPage = () => {
    const isRavenUser = hasRavenUserRole()

    if (isRavenUser) {
        return (
            <UserListProvider>
                <ChannelListProvider>
                    <ActiveUsersProvider>
                        <Flex>
                            <Box className={`w-64 bg-gray-2 border-r-gray-3 border-r dark:bg-gray-1`} left="0" top='0' position="fixed">
                                <Sidebar />
                            </Box>
                            <Box className='ml-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width))] dark:bg-gray-2'>
                                <VirtuosoRefProvider>
                                    <Outlet />
                                </VirtuosoRefProvider>
                            </Box>
                        </Flex>
                    </ActiveUsersProvider>
                </ChannelListProvider>
            </UserListProvider>
        )
    } else {
        // If the user does not have the Raven User role, then show an error message if the user cannot add more people.
        // Else, show the page to add people to Raven
        return <Suspense fallback={<FullPageLoader />}>
            <AddRavenUsersPage />
        </Suspense>
    }

}