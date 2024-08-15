import { useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '../../../../../../types/Messaging/Message'
import { useParams } from 'react-router-dom'

export const useSendMessage = (channelID: string, noOfFiles: number, uploadFiles: () => Promise<void>, handleCancelReply: VoidFunction, isThread?: boolean, selectedMessage?: Message | null) => {

    const { call, loading } = useFrappePostCall('raven.api.raven_message.send_message')
    const { threadID } = useParams()

    const sendMessage = async (content: string, json?: any): Promise<void> => {

        if (content) {
            return call({
                channel_id: channelID,
                text: content,
                json_content: json,
                is_reply: selectedMessage ? 1 : 0,
                is_thread_message: isThread ? 1 : 0,
                thread_id: threadID,
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