import { Flex, Box, Stack, useColorMode } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { UserDataProvider } from '../utils/user/UserDataProvider'

type Props = {}

export const MainPage = (props: Props) => {

    const { colorMode } = useColorMode()
    return (
        <UserDataProvider>
            <Flex height="100vh" sx={{ '--sidebar-width': '16rem' }} >
                <Box bg={colorMode === "light" ? "gray.50" : "black"} h="100vh" fontSize="sm" width="var(--sidebar-width)" left="0" position="fixed" zIndex="999">
                    <Stack h="full" direction="column" py="4" spacing="4" overflow="auto" px="3" {...props}>
                        <Sidebar />
                    </Stack>
                </Box>
                <Box
                    overflow="auto"
                    bgColor={colorMode === "light" ? "white" : "gray.900"}
                    w='calc(100vw - var(--sidebar-width))'
                    position="relative"
                    left='var(--sidebar-width)'
                >
                    <Outlet />
                </Box>
            </Flex>
        </UserDataProvider>
    )
}