import { PropsWithChildren } from 'react'
import { Box, Flex } from '@radix-ui/themes'

export const PageHeader = ({ children }: PropsWithChildren) => {
    return (
        <header className='dark:bg-gray-2 bg-white fixed top-0' style={{
            zIndex: 999
        }}>
            <Box
                py='3'
                mx='4'
                // position='fixed'
                // top='0'
                className='border-gray-4 dark:border-gray-6 border-b'
                style={{
                    width: 'calc(100vw - var(--sidebar-width) - var(--space-6))',
                }}>
                <Flex justify='between'>
                    {children}
                </Flex>
            </Box>
        </header>
    )
}