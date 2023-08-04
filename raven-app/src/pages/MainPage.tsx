import { Flex, Box, Stack, useColorModeValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { UserDataProvider } from '../utils/user/UserDataProvider'
import { VirtuosoRefProvider } from '../utils/message/VirtuosoRefProvider'
import { useActiveState } from '../hooks/useActiveState'

type Props = {}

export const MainPage = (props: Props) => {

    const isUserActive = useActiveState()

    const chatInterfaceBackground = useColorModeValue("white", "gray.900")
    const sidebarBackground = useColorModeValue("gray.50", "black")

    return (
        <UserDataProvider>
            <VirtuosoRefProvider>
                <Flex height="100vh" sx={{ '--sidebar-width': '16rem' }} >
                    <Box bg={sidebarBackground} h="100vh" fontSize="sm" width="var(--sidebar-width)" left="0" position="fixed" zIndex="999">
                        <Stack h="full" direction="column" spacing="4" overflow="auto" {...props}>
                            <Sidebar isUserActive={isUserActive} />
                        </Stack>
                    </Box>
                    <Box
                        overflow="auto"
                        bgColor={chatInterfaceBackground}
                        w='calc(100vw - var(--sidebar-width))'
                        position="relative"
                        left='var(--sidebar-width)'
                    >
                        <Outlet />
                    </Box>
                </Flex>
            </VirtuosoRefProvider>
        </UserDataProvider>
    )
}