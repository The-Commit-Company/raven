import { useFrappePostCall } from 'frappe-react-sdk'
import useFileUpload from '@raven/lib/hooks/useFileUpload'
import { useAtomValue } from 'jotai'
import { selectedReplyMessageAtomFamily } from '@lib/ChatInputUtils'

// TODO: This is older version of the useSendMessage hook compared to web, needs to be updated.
export const useSendMessage = (siteID: string, channelID: string, onSend: VoidFunction) => {


    const selectedMessage = useAtomValue(selectedReplyMessageAtomFamily(siteID + channelID))
    const { uploadFiles } = useFileUpload(siteID, channelID)
    const { call, loading } = useFrappePostCall('raven.api.raven_message.send_message')

    const sendMessage = async (content: string, sendWithoutFiles = false): Promise<void> => {

        if (content) {

            return call({
                channel_id: channelID,
                text: content,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null
            })
                .then(() => onSend())
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