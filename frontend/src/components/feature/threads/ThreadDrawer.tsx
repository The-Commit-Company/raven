import { Box, Flex, Heading } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import { ThreadMessages } from './ThreadMessages'

const ThreadDrawer = () => {
    const { threadID } = useParams()
    return (
        <Flex direction='column' gap='0' className='w-[120rem] h-[vh] border-l dark:bg-gray-2 bg-white z-[999]'>
            <header>
                <Box py='4' className='border-gray-4 border-b pl-4 pr-2'>
                    <Heading size='4'>Thread</Heading>
                </Box>
            </header>
            <ThreadMessages threadID={threadID ?? ''} />
        </Flex>
    )
}

export const Component = ThreadDrawer