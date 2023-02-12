import { Box, Divider, HStack } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { OPACITY_ON_LOAD } from '../../../utils/layout/animations'

export const PageHeader = ({ children }: PropsWithChildren) => {
    return (
        <Box p={4}>
            <HStack justify="space-between" {...OPACITY_ON_LOAD} minH='40px' pb='2'>
                {children}
            </HStack>
            <Divider />
        </Box>
    )
}