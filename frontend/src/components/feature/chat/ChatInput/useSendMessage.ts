import { useFrappePostCall } from 'frappe-react-sdk'
import * as chrono from 'chrono-node';
import { Message } from '../../../../../../types/Messaging/Message'

export const useSendMessage = (channelID: string, noOfFiles: number, uploadFiles: () => Promise<void>, handleCancelReply: VoidFunction, selectedMessage?: Message | null) => {

    const { call, loading } = useFrappePostCall('raven.api.raven_message.send_message')

    const parseDates = (content: string): string => {

        let parsedContent = content

        const parsedDates = chrono.parse(parsedContent, undefined, {
            forwardDate: true
        })

        // Sort parsedDates in reverse order based on their index. This is to ensure that we replace from the end to preserve the indices of the replaced strings.
        parsedDates.sort((a, b) => b.index - a.index)

        parsedDates.forEach(date => {

            // Ignore if neither hour, minute, or date is certain
            if (!date.start.isCertain('hour') && !date.start.isCertain('minute') && !date.start.isCertain('day')) {
                return
            }

            // TODO: Also ignore if it's singular - like "Let's have a quick 30 minute call"

            const hasStartTime = date.start.isCertain('hour') && date.start.isCertain('minute')

            const startTime: number = date.start.date().getTime()

            const endTime: number | null = date.end?.date().getTime() ?? null

            const hasEndTime = endTime ? date.end?.isCertain('hour') && date.end?.isCertain('minute') : false

            // Replace the text with a span containing the timestamp after the given "index")
            const index = date.index
            const text = date.text

            let attributes = ''
            if (startTime) attributes += `data-timestamp-start="${startTime}"`

            if (endTime) attributes += ` data-timestamp-end="${endTime}"`

            if (!hasStartTime) {
                attributes += ' data-timestamp-start-all-day="true"'
            }

            if (!hasEndTime) {
                attributes += ' data-timestamp-end-all-day="true"'
            }

            parsedContent = parsedContent.slice(0, index) + `<span class="timestamp" ${attributes}">${text}</span>` + parsedContent.slice(index + text.length)
        })
        return parsedContent
    }

    const sendMessage = async (content: string, json?: any): Promise<void> => {

        if (content) {
            // Parse the content to replace any "human" dates with a timestamp element
            content = parseDates(content)

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