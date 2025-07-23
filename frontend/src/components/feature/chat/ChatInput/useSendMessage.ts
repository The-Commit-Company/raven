import { useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '../../../../../../types/Messaging/Message'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'
import { useCallback } from 'react'
import { filesAtom } from './FileInput/useFileUpload'
import { useAtomCallback } from 'jotai/utils'

export const useSendMessage = (channelID: string, uploadFiles: (selectedMessage?: Message | null, caption?: string) => Promise<RavenMessage[]>, onMessageSent: (messages: RavenMessage[]) => void, selectedMessage?: Message | null) => {

    const { call, loading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')

    // const files = useAtomValue(filesAtom(channelID))

    const getFiles = useAtomCallback(useCallback((get) => {
        return get(filesAtom(channelID))
    }, [channelID]))

    const sendMessage = useCallback(async (content: string, json?: any, sendSilently: boolean = false): Promise<void> => {

        const files = getFiles()

        const hasFiles = files.length > 0

        // If we have both content and files, upload files with the content as caption
        if (content && hasFiles) {
            return uploadFiles(selectedMessage, content)
                .then((res) => {
                    onMessageSent(res)
                })
        }
        // If we only have content, send a regular text message
        else if (content) {
            return call({
                channel_id: channelID,
                text: content,
                json_content: json,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null,
                send_silently: sendSilently ? true : false
            })
                .then((res) => onMessageSent([res.message]))
        }
        // If we only have files, upload them without caption
        else if (hasFiles) {
            return uploadFiles(selectedMessage)
                .then((res) => {
                    onMessageSent(res)
                })
        }
        // No content and no files - do nothing
        else {
            return Promise.resolve()
        }
    }, [channelID, selectedMessage, uploadFiles, onMessageSent])


    return {
        sendMessage,
        loading
    }
}