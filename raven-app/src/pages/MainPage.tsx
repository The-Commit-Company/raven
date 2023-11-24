import { Flex, Box } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { VirtuosoRefProvider } from '../utils/message/VirtuosoRefProvider'
import { useActiveState } from '../hooks/useActiveState'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'
import { UserListProvider } from '@/utils/users/UserListProvider'
import { ActiveUsersProvider } from '@/utils/users/ActiveUsersProvider'
import { useTheme } from '@/ThemeProvider'

export const MainPage = () => {

    const { appearance } = useTheme()

    const sidebarBgColor = appearance === 'light' ? 'bg-[var(--slate-2)]' : 'bg-[var(--color-background)]'

    return (
        <UserListProvider>
            <ChannelListProvider>
                <ActiveUsersProvider>
                    <Flex>
                        <Box className={`w-64 ${sidebarBgColor}`} left="0" position="fixed">
                            <Sidebar />
                        </Box>
                        <Box
                            className='ml-[var(--sidebar-width)] w-[calc(100vw-var(--sidebar-width))]'
                        >
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