import { useFrappePostCall } from 'frappe-react-sdk'
import { Message } from '../../../../../../types/Messaging/Message'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'

interface TimelineMentionData {
    timeline_id: string
    experiment_id: string
    timeline_task: string
}

export const useSendTimelineMessage = (channelID: string, uploadFiles: (selectedMessage?: Message | null, caption?: string) => Promise<RavenMessage[]>, onMessageSent: (messages: RavenMessage[]) => void, selectedMessage?: Message | null, hasFiles?: boolean) => {

    const { call: sendMessageCall, loading: sendMessageLoading } = useFrappePostCall<{ message: RavenMessage }>('raven.api.raven_message.send_message')
    const { call: addTimelineUpdateCall, loading: timelineUpdateLoading } = useFrappePostCall('raven.api.timeline_api.add_timeline_update')

    const extractTimelineMentions = (json: any): TimelineMentionData[] => {
        const mentions: TimelineMentionData[] = []
        
        if (!json || !json.content) return mentions
        
        const traverseContent = (content: any[]) => {
            content.forEach((node: any) => {
                if (node.type === 'timelineMention' && node.attrs) {
                    mentions.push({
                        timeline_id: node.attrs.timeline_id,
                        experiment_id: node.attrs.experiment_id,
                        timeline_task: node.attrs.timeline_task
                    })
                }
                if (node.content) {
                    traverseContent(node.content)
                }
            })
        }
        
        traverseContent(json.content)
        return mentions
    }

    const extractPlainTextAfterMention = (content: string, json: any): string => {
        // Extract text that comes after timeline mentions
        if (!json || !json.content) return ''
        
        let plainText = ''
        const traverseContent = (content: any[]) => {
            content.forEach((node: any, index: number) => {
                if (node.type === 'paragraph' && node.content) {
                    node.content.forEach((child: any, childIndex: number) => {
                        if (child.type === 'text' && child.text) {
                            // Check if this text comes after a timeline mention
                            if (childIndex > 0) {
                                const prevNode = node.content[childIndex - 1]
                                if (prevNode.type === 'timelineMention') {
                                    plainText += child.text.trim() + ' '
                                }
                            }
                        }
                        // If the text is standalone (not after mention), add it anyway
                        else if (child.type === 'text' && child.text && childIndex === 0) {
                            // Check if there's a timeline mention in the same paragraph
                            const hasTimelineMention = node.content.some((n: any) => n.type === 'timelineMention')
                            if (!hasTimelineMention) {
                                plainText += child.text.trim() + ' '
                            }
                        }
                    })
                }
            })
        }
        
        traverseContent(json.content)
        return plainText.trim()
    }

    const sendMessage = async (content: string, json?: any, sendSilently: boolean = false): Promise<void> => {
        // Extract timeline mentions from the JSON content
        const timelineMentions = json ? extractTimelineMentions(json) : []
        
        // If we have both content and files, upload files with the content as caption
        if (content && hasFiles) {
            const messages = await uploadFiles(selectedMessage, content)
            onMessageSent(messages)
            
            // Handle timeline updates if there are mentions
            if (timelineMentions.length > 0) {
                const updateText = extractPlainTextAfterMention(content, json)
                await Promise.all(timelineMentions.map(mention => 
                    addTimelineUpdateCall({
                        timeline_id: mention.timeline_id,
                        update_text: updateText || content
                    })
                ))
            }
            
            return
        }
        // If we only have content, send a regular text message
        else if (content) {
            const res = await sendMessageCall({
                channel_id: channelID,
                text: content,
                json_content: json,
                is_reply: selectedMessage ? 1 : 0,
                linked_message: selectedMessage ? selectedMessage.name : null,
                send_silently: sendSilently ? true : false
            })
            
            onMessageSent([res.message])
            
            // Handle timeline updates if there are mentions
            if (timelineMentions.length > 0) {
                const updateText = extractPlainTextAfterMention(content, json)
                await Promise.all(timelineMentions.map(mention => 
                    addTimelineUpdateCall({
                        timeline_id: mention.timeline_id,
                        update_text: updateText || content
                    })
                ))
            }
            
            return
        }
        // If we only have files, upload them without caption
        else if (hasFiles) {
            const messages = await uploadFiles(selectedMessage)
            onMessageSent(messages)
            return
        }
        // No content and no files - do nothing
        else {
            return Promise.resolve()
        }
    }

    return {
        sendMessage,
        loading: sendMessageLoading || timelineUpdateLoading
    }
}