import { Flex, Box, Stack, StackProps, useColorMode } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

interface Props extends StackProps {
    children: React.ReactNode,
    sidebarWidth?: string
}

export const Sidebar = ({ children, sidebarWidth, ...props }: Props) => {

    const { colorMode } = useColorMode()

    return (
        <Flex height="100vh" sx={{ '--sidebar-width': sidebarWidth ?? '16rem' }} >
            <Box bg={colorMode === "light" ? "gray.50" : "gray.900"} h="100vh" fontSize="sm" width="var(--sidebar-width)" left="0" position="fixed" zIndex="999">
                <Stack h="full" direction="column" py="4" spacing="4" overflow="auto" px="3" {...props}>
                    {children}
                </Stack>
            </Box>
            <Box
                overflow="auto"
                w='calc(100vw - var(--sidebar-width))'
                position="relative"
                left='var(--sidebar-width)'
            >
                <Outlet />
            </Box>
        </Flex>
    )

}
