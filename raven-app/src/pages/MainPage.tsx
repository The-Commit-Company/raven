import { Flex, Box, Stack, useColorMode, useToast } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { UserDataProvider } from '../utils/user/UserDataProvider'
import { useIdleTimer, PresenceType } from 'react-idle-timer'
import { useEffect, useState } from 'react'
import { useFrappePostCall } from "frappe-react-sdk"
import { AlertBanner } from '../components/layout/AlertBanner'

type Props = {}

export const MainPage = (props: Props) => {

    const { call: refreshUserActiveState, error, reset } = useFrappePostCall('raven.api.user_availability.refresh_user_active_state')

    const [isUserActive, setIsUserActive] = useState(true)
    const toast = useToast()

    useEffect(() => {
        if (isUserActive) {
            reset()
        }
    }, [isUserActive])

    const onPresenceChange = (presence: PresenceType) => {
        if (presence.type === 'active' && !isUserActive) {
            refreshUserActiveState({}).then(() => setIsUserActive(true))
        }
        else if (presence.type === 'idle' && isUserActive) {
            setIsUserActive(false)
        }
    }

    useEffect(() => {
        if (error && !toast.isActive('refresh-active-state-error')) {
            toast({
                description: "There was an error while refreshing your active state. You may appear offline to other users.",
                status: "error",
                duration: 4000,
                size: 'sm',
                render: ({ onClose }) => <AlertBanner onClose={onClose} variant='solid' status='error' fontSize="sm">
                    There was an error while refreshing your login state.<br />You may appear offline to other users.
                </AlertBanner>,
                id: 'refresh-active-state-error',
                variant: 'left-accent',
                isClosable: true,
                position: 'bottom-right'
            })
        }
    }, [error])


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