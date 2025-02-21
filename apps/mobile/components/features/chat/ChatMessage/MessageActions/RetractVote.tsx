import { useCallback, useState } from 'react'
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '@raven/types/common/Message'
import { Poll } from '../Renderers/PollMessage'
import { toast } from 'sonner-native'
import { Pressable } from 'react-native'
import ArrowBackRetractIcon from "@assets/icons/ArrowBackRetractIcon.svg"
import { useColorScheme } from '@hooks/useColorScheme'
import { Text } from '@components/nativewindui/Text'

interface RetractVoteProps {
    message: Message
    onClose: () => void
}

const RetractVote = ({ message, onClose }: RetractVoteProps) => {

    const { retractVote, poll_data } = useRetractVote(message)
    const { colors } = useColorScheme()

    if (poll_data && poll_data?.message.current_user_votes.length > 0)
        return (
            <Pressable
                onPress={() => retractVote(onClose)}
                className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
                <ArrowBackRetractIcon width={18} height={18} fill={colors.icon} />
                <Text className='text-base text-foreground'>Retract vote</Text>
            </Pressable>
        )

    return null
}

export default RetractVote

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