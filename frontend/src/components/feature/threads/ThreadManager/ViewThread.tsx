import { Box, Flex } from '@radix-ui/themes'
import { useParams } from 'react-router-dom'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { FullPageLoader } from '@/components/layout/Loaders/FullPageLoader'
import { Message } from '../../../../../../types/Messaging/Message'
import { ThreadMessages } from '../ThreadDrawer/ThreadMessages'
import { ThreadHeader } from '../ThreadDrawer/ThreadHeader'
import useThreadPageActive from '@/hooks/useThreadPageActive'

/**
 * Component to view a thread within the Thread Manager. Similar to the ThreadDrawer, but without the border and better header.
 * @returns 
 */
const ViewThread = () => {

    const { threadID } = useParams()
    const { data, error, isLoading } = useFrappeGetDoc<Message>('Raven Message', threadID, threadID, {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        keepPreviousData: false
    })

    useThreadPageActive(threadID)

    return (
        <div>
            <Flex direction='column' gap='0' className='w-full h-screen'>
                <ThreadHeader />
                {isLoading && <FullPageLoader />}
                {error && <Box p='4'><ErrorBanner error={error} /></Box>}
                {data && <ThreadMessages threadMessage={data} key={threadID} />}
            </Flex>
        </div>
    )
}

export const Component = ViewThread