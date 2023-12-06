import { Flex, Box } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { VirtuosoRefProvider } from '../utils/message/VirtuosoRefProvider'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { ActiveUsersProvider } from '@/utils/users/ActiveUsersProvider'

export const MainPage = () => {

    return (
        <UserListProvider>
            <ChannelListProvider>
                <ActiveUsersProvider>
                    <Flex>
                        <Box className={`w-64 bg-[var(--gray-2)] border-r-[var(--gray-3)] border-r dark:bg-[var(--gray-1)]`} left="0" top='0' position="fixed">
                            <Sidebar />
                        </Box>
                        <Box className='ml-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width))] dark:bg-[var(--gray-2)]'>
                            <VirtuosoRefProvider>
                                <Outlet />
                            </VirtuosoRefProvider>
                        </Box>
                    </Flex>
                </ActiveUsersProvider>
            </ChannelListProvider>
        </UserListProvider>
    )
}