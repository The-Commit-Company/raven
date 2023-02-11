import { Divider, HStack } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { OPACITY_ON_LOAD } from '../../../utils/layout/animations'

export const PageHeader = ({ children }: PropsWithChildren) => {
    return (
        <>
            <HStack justify="space-between" {...OPACITY_ON_LOAD} minH='32px'>
                {children}
            </HStack>
            <Divider />
        </>
    )
}