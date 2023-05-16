import { Center } from '@chakra-ui/react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { Navigate } from 'react-router-dom'
import { AlertBanner } from '../../components/layout/AlertBanner'
import { FullPageLoader } from '../../components/layout/Loaders'

interface lastChannel {
    channel_id: string
}

export const ChannelRedirect = () => {
    const { data, error } = useFrappeGetCall<{ message: lastChannel }>('raven.raven_messaging.doctype.raven_message.raven_message.get_last_channel')
    if (!data && !error) {
        return <FullPageLoader />
    }

    if (error) {
        return (
            <Center width='100vw' height='100vh'>
                <AlertBanner status='error' heading={error.message}>{error.httpStatusText} - {error.httpStatus}</AlertBanner>
            </Center>
        )
    }

    return <Navigate to={`/channel/${data?.message}`} replace />
}