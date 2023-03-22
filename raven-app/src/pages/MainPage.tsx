import { Flex, Box, Stack, useColorMode, useToast } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { UserDataProvider } from '../utils/user/UserDataProvider'
import { useIdleTimer, PresenceType } from 'react-idle-timer'
import { useState } from 'react'
import { useFrappeGetCall } from "frappe-react-sdk"

type Props = {}

export const MainPage = (props: Props) => {

    const { data: refreshLoggedInState, error } = useFrappeGetCall('raven.api.user_availability.refresh_logged_in_state')

    const [isUserActive, setIsUserActive] = useState(true)
    const toast = useToast()

    const onPresenceChange = (presence: PresenceType) => {
        if (presence.type === 'active') {
            refreshLoggedInState
            error ? toast({
                title: "Error refreshing online status",
                description: "You may appear offline to other users.",
                status: "error",
                duration: 2000,
                isClosable: true
            }) : setIsUserActive(true)
        }
        else if (presence.type === 'idle') {
            setIsUserActive(false)
        }
    }


    const idleTimer = useIdleTimer({ onPresenceChange, timeout: 1000 * 60 * 15 })
    const { colorMode } = useColorMode()
    return (
        <UserDataProvider>
            <Flex height="100vh" sx={{ '--sidebar-width': '16rem' }} >
                <Box bg={colorMode === "light" ? "gray.50" : "black"} h="100vh" fontSize="sm" width="var(--sidebar-width)" left="0" position="fixed" zIndex="999">
                    <Stack h="full" direction="column" py="4" spacing="4" overflow="auto" px="3" {...props}>
                        <Sidebar isUserActive={isUserActive} />
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