import { Box, Flex } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import { ThreadMessages } from './ThreadMessages'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import { FullPageLoader } from '@/components/layout/Loaders'
import { ThreadHeader } from './ThreadHeader'

const ThreadDrawer = () => {

    const { threadID } = useParams()
    const { data, error, isLoading } = useFrappeGetDoc('Raven Message', threadID, threadID, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        keepPreviousData: false
    })

    return (
        <div>
            {data && <Flex direction='column' gap='0' className='w-full h-[100vh] border-l dark:bg-gray-2 bg-white'>
                <ThreadHeader threadMessage={data} />
                {isLoading && <FullPageLoader />}
                {error && <Box p='4'><ErrorBanner error={error} /></Box>}
                <ThreadMessages />
            </Flex>}
        </div>
    )
}

export const Component = ThreadDrawer