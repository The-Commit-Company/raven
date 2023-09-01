import { Flex, Box, useColorModeValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { VirtuosoRefProvider } from '../utils/message/VirtuosoRefProvider'
import { useActiveState } from '../hooks/useActiveState'
import { ChannelListProvider } from '../utils/channel/ChannelListProvider'

export const MainPage = () => {

    const isUserActive = useActiveState()

    const chatInterfaceBackground = useColorModeValue("white", "gray.900")
    const sidebarBackground = useColorModeValue("gray.50", "black")

    return (
        <ChannelListProvider>
            <Flex height="100vh" sx={{ '--sidebar-width': '16rem' }} >
                <Box bg={sidebarBackground} h="100vh" fontSize="sm" width="var(--sidebar-width)" left="0" position="fixed" zIndex="999">
                    <Sidebar isUserActive={isUserActive} />
                </Box>
                <Box
                    overflow="auto"
                    bgColor={chatInterfaceBackground}
                    w='calc(100vw - var(--sidebar-width))'
                    position="relative"
                    left='var(--sidebar-width)'
                >
                    <VirtuosoRefProvider>
                        <Outlet />
                    </VirtuosoRefProvider>
                </Box>
            </Flex>
        </ChannelListProvider>
    )
}