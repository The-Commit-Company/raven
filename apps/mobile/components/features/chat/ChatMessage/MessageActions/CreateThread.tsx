import { Message } from '@raven/types/common/Message'
import { Pressable } from 'react-native'
import { Text } from '@components/nativewindui/Text'
import { useColorScheme } from '@hooks/useColorScheme'
import { useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner-native"
import MessageIcon from "@assets/icons/MessageIcon.svg"
import { router } from 'expo-router'

interface CreateThreadProps {
    message: Message
    onClose: () => void
}

const CreateThread = ({ message, onClose }: CreateThreadProps) => {

    const { colors } = useColorScheme()
    const { createThread } = useCreateThread(message)

    const onPress = () => {
        createThread()
            .then((thread) => {
                onClose()
                if (thread) {
                    router.push(`../thread/${thread.thread_id}`)
                }
            })
    }

    return (
        <Pressable
            onPress={onPress}
            className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-linkColor'
            android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}>
            <MessageIcon width={18} height={18} fill={colors.icon} />
            <Text className='text-base text-foreground'>Create thread</Text>
        </Pressable>
    )
}

export default CreateThread

const useCreateThread = (message: Message) => {

    const { call, loading } = useFrappePostCall<{ message: { channel_id: string, thread_id: string } }>("raven.api.threads.create_thread")

    const handleCreateThread = () => {
        return call({ message_id: message?.name })
            .then((res) => {
                toast.success("Thread created successfully!")

                return res.message
            })
            .catch((error) => {
                toast.error("Failed to create thread")
            })
    }

    return {
        createThread: handleCreateThread,
        loading
    }
}
