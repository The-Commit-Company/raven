import { useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '../../../../../../types/Messaging/Message'

export const useSendMessage = (channelID: string, noOfFiles: number, uploadFiles: () => Promise<void>, handleCancelReply: VoidFunction, selectedMessage?: Message | null) => {

    const { call, loading } = useFrappePostCall('raven.api.raven_message.send_message')

    const sendMessage = async (content: string, json?: any): Promise<void> => {

        if (content) {

            return call({
                channel_id: channelID,
                text: content,
                json_content: json,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null
            })
                .then(() => handleCancelReply())
                .then(() => uploadFiles())
                .then(() => {
                    handleCancelReply()
                })
        } else if (noOfFiles > 0) {
            return uploadFiles()
                .then(() => {
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