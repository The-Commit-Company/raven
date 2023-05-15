import { Box, Divider, HStack, useColorMode } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { OPACITY_ON_LOAD } from '../../../utils/layout/animations'

export const PageHeader = ({ children }: PropsWithChildren) => {

    const { colorMode } = useColorMode()

    return (
        <Box p={4} pos='fixed' top='0' w='calc(100vw - var(--sidebar-width))' zIndex={10} bg={colorMode === 'light' ? 'white' : 'gray.900'}>
            <HStack justify="space-between" {...OPACITY_ON_LOAD} minH='40px' pb='2'>
                {children}
            </HStack>
            <Divider />
        </Box>
    )
}