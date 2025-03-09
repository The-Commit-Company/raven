import { Message } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import { useState } from "react"
import { useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner-native"
import MessageIcon from "@assets/icons/MessageIcon.svg"

interface CreateThreadProps {
    message: Message
    onClose: () => void
}

const CreateThread = ({ message, onClose }: CreateThreadProps) => {

    const { colors } = useColorScheme()
    const { createThread } = useCreateThread(message)

    return (
        <Pressable
            onPress={() => createThread(onClose)}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <MessageIcon width={18} height={18} fill={colors.icon} />
            <Text className='text-base text-foreground'>Create thread</Text>
        </Pressable>
    )
}

export default CreateThread

const useCreateThread = (message: Message) => {

    const { call } = useFrappePostCall("raven.api.threads.create_thread")
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateThread = (onSuccess: () => void) => {
        setIsLoading(true)
        return call({ message_id: message?.name })
            .then((res) => {
                toast.success("Thread created successfully!")
                onSuccess()
            })
            .catch(() => {
                toast.error("Failed to create thread")
                throw new Error("Failed to create thread")
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return {
        createThread: handleCreateThread
    }
}
