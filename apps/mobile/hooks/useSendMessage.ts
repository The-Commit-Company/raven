import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import useFileUpload from '@raven/lib/hooks/useFileUpload'
import { useAtomValue } from 'jotai'
import { selectedReplyMessageAtomFamily } from '@lib/ChatInputUtils'
import { RavenMessage } from '@raven/types/RavenMessaging/RavenMessage'
import { GetMessagesResponse } from '@raven/types/common/ChatStream'

// TODO: This is older version of the useSendMessage hook compared to web, needs to be updated.
export const useSendMessage = (siteID: string, channelID: string, onSend: VoidFunction) => {


    const selectedMessage = useAtomValue(selectedReplyMessageAtomFamily(siteID + channelID))
    const { uploadFiles } = useFileUpload(siteID, channelID)
    const { call, loading } = useFrappePostCall('raven.api.raven_message.send_message')

    const onMessageSendCompleted = useOnMessageSendCompleted(channelID)

    const sendMessage = async (content: string, sendWithoutFiles = false, sendSilently = false): Promise<void> => {

        if (content) {

            return call({
                channel_id: channelID,
                text: content,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null,
                send_silently: sendSilently
            })
                .then((res) => {
                    onMessageSendCompleted([res.message])
                    onSend()
                })
                .then(() => {
                    if (!sendWithoutFiles) {
                        return uploadFiles()
                    }
                })
                .then(() => {
                    onSend()
                })
        } else {
            return uploadFiles()
                .then(() => {
                    onSend()
                })
        }
    }


    return {
        sendMessage,
        loading
    }
}

const useOnMessageSendCompleted = (channelID: string) => {
    const { mutate } = useSWRConfig()

    const onMessageSendCompleted = (messages: RavenMessage[]) => {
        // Update the messages in the cache

        mutate({ path: `get_messages_for_channel_${channelID}` }, (data?: GetMessagesResponse) => {
            if (data && data?.message.has_new_messages) {
                return data
            }

            const existingMessages = data?.message.messages ?? []

            const newMessages = [...existingMessages]

            messages.forEach(message => {
                // Check if the message is already present in the messages array
                const messageIndex = existingMessages.findIndex(m => m.name === message.name)

                if (messageIndex !== -1) {
                    // If the message is already present, update the message
                    // @ts-ignore
                    newMessages[messageIndex] = {
                        ...message,
                        _liked_by: "",
                        is_pinned: 0,
                        is_continuation: 0
                    }
                } else {
                    // If the message is not present, add the message to the array
                    // @ts-ignore
                    newMessages.push({
                        ...message,
                        _liked_by: "",
                        is_pinned: 0,
                        is_continuation: 0
                    })
                }
            })

            return {
                message: {
                    messages: newMessages.sort((a, b) => {
                        return new Date(b.creation).getTime() - new Date(a.creation).getTime()
                    }),
                    has_new_messages: false,
                    has_old_messages: data?.message.has_old_messages ?? false
                }
            }

        }, { revalidate: false })

    }

    return onMessageSendCompleted
}

