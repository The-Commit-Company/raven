import { Message } from '@raven/types/common/Message'
import { useColorScheme } from '@hooks/useColorScheme'
import { useFrappePostCall } from "frappe-react-sdk"
import { toast } from "sonner-native"
import MessageIcon from "@assets/icons/MessageIcon.svg"
import { router } from 'expo-router'
import ActionButton from '@components/common/Buttons/ActionButton'

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
        <ActionButton
            onPress={onPress}
            icon={<MessageIcon width={18} height={18} fill={colors.icon} />}
            text='Create thread'
        />
    )
}

export default CreateThread

const useCreateThread = (message: Message) => {

    const { call, loading } = useFrappePostCall<{ message: { channel_id: string, thread_id: string } }>("raven.api.threads.create_thread")

    const handleCreateThread = () => {
        return call({ message_id: message?.name })
            .then((res) => {
                toast.success("Thread created.")

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
