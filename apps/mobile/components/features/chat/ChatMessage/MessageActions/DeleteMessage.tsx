import { Message } from '@raven/types/common/Message'
import { useFrappeDeleteDoc, useSWRConfig } from 'frappe-react-sdk'
import { useCallback } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { toast } from 'sonner-native'
import { Text } from '@components/nativewindui/Text'
import TrashIcon from "@assets/icons/TrashIcon.svg"
import { useColorScheme } from '@hooks/useColorScheme'
import { GetMessagesResponse } from '@raven/types/common/ChatStream'

interface DeleteMessageProps {
    message: Message
    onClose: () => void
}

const DeleteMessage = ({ message, onClose }: DeleteMessageProps) => {

    // const deleteAlertRef = React.useRef<AlertRef>(null)
    const { deleteMessage, loading } = useMessageDelete(message)

    const onDelete = () => {
        deleteMessage()
            .then(() => onClose())
    }

    const onMessageDelete = useCallback(() => {
        Alert.alert('Delete message?', 'Are you sure you want to delete this message? It will be deleted for all users.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
        ])
    }, [])

    const { isDarkColorScheme } = useColorScheme()

    return (
        <View>
            <Pressable
                onPress={onMessageDelete}
                hitSlop={10}
                className='flex flex-row items-center gap-3 p-2 rounded-lg ios:active:bg-destructive/5 dark:ios:active:bg-destructive/10'
                android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                disabled={loading}>
                <TrashIcon width={18} height={18} fill={isDarkColorScheme ? '#f87171' : '#dc2626'} />
                <Text className='text-base text-red-600 dark:text-red-400'>Delete message</Text>
            </Pressable>
        </View>
    )
}

export default DeleteMessage

const useMessageDelete = (message: Message) => {

    const { mutate } = useSWRConfig()

    const { deleteDoc, loading } = useFrappeDeleteDoc()

    const deleteMessage = async () => {

        const removeMessageFromCache = (data?: GetMessagesResponse): GetMessagesResponse => {

            const existingMessages = data?.message.messages ?? []

            const newMessages = existingMessages.filter((m) => m.name !== message.name)

            return {
                message: {
                    has_old_messages: data?.message.has_old_messages ?? true,
                    has_new_messages: data?.message.has_new_messages ?? false,
                    messages: newMessages
                }
            }
        }

        // Delete the message optimistically
        return mutate({ path: `get_messages_for_channel_${message.channel_id}` }, async (data?: GetMessagesResponse) => {
            // Make the request
            return deleteDoc('Raven Message', message.name).then(() => {
                toast.success('Message deleted', {
                    duration: 500,
                })
            }).then(() => {
                return removeMessageFromCache(data)
            })
        }, {
            optimisticData: removeMessageFromCache,
            rollbackOnError: true,
            revalidate: false
        }).catch(() => {
            toast.error("Failed to delete message.")
        })
    }
    return { deleteMessage, loading }
}