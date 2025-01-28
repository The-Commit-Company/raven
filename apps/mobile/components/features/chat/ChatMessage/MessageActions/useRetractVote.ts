import { useCallback, useState } from 'react'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '@raven/types/common/Message'
import { Poll } from '../Renderers/PollMessage'
import { toast } from 'sonner-native'

const useRetractVote = (message: Message) => {

    const [isLoading, setIsLoading] = useState(false)

    const { data: poll_data } = useFrappeGetCall<{ message: Poll }>('raven.api.raven_poll.get_poll', {
        'message_id': message?.name,
    }, `poll_data_${message?.poll_id}`, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    const { call } = useFrappePostCall('raven.api.raven_poll.retract_vote')

    const retractVote = useCallback(async (onSuccess: () => void) => {
        setIsLoading(true)
        try {
            await call({
                poll_id: message?.poll_id,
            })
            onSuccess()
            toast.success('Vote retracted')
            setIsLoading(false)
        } catch (e: unknown) {
            toast.error('Could not retract vote')
        }
    }, [message])

    return { retractVote, poll_data, isLoading }
}

export default useRetractVote