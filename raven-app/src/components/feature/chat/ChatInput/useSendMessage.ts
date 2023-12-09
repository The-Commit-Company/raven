import { useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import { Message } from '../../../../../../types/Messaging/Message'

export const useSendMessage = (channelID: string, noOfFiles: number, uploadFiles: () => Promise<void>, handleCancelReply: VoidFunction, selectedMessage?: Message | null) => {

    const { mutate } = useSWRConfig()
    const { call, loading } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')

    const sendMessage = async (content: string, json?: any): Promise<void> => {

        if (content) {
            return call({
                channel_id: channelID,
                text: content,
                json: json,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null
            })
                .then(() => handleCancelReply())
                .then(() => uploadFiles())
                .then(() => {
                    mutate(`get_messages_for_channel_${channelID}`)
                    handleCancelReply()
                })
        } else if (noOfFiles > 0) {
            return uploadFiles()
                .then(() => {
                    mutate(`get_messages_for_channel_${channelID}`)
                    handleCancelReply()
                })
        } else {
            return Promise.resolve()
        }
    }


    return {
        sendMessage,
        loading
    }
}