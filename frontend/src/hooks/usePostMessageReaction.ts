import { FrappeConfig, FrappeContext, useSWRConfig } from 'frappe-react-sdk'
import { useCallback, useContext } from 'react'
import { Message } from '../../../types/Messaging/Message'
import { GetMessagesResponse } from '@/components/feature/chat/ChatStream/useChatStream'
import { ReactionObject } from '@/components/feature/chat/ChatMessage/MessageReactions'
import { useUserData } from './useUserData'

/**
 * This hook is used to post a reaction to a message optimistically
 * @returns A function to post a reaction to a message
 */
const usePostMessageReaction = () => {

    const { call } = useContext(FrappeContext) as FrappeConfig

    const { mutate } = useSWRConfig()

    const { name: username } = useUserData()

    const postReaction = useCallback((message: Message, emoji: string, is_custom: boolean = false, emoji_name?: string) => {

        const updateMessageWithReaction = (data?: GetMessagesResponse) => {
            const existingMessages = data?.message.messages ?? []

            // Find the message with the ID and update it's reactions object
            const newMessages = existingMessages.map(m => {
                if (m.name !== message.name) {
                    return m
                }

                // If the message ID matches, we need to update the reactions object
                const existingReactions = JSON.parse(m.message_reactions ?? '{}') as Record<string, ReactionObject>

                // Check if the emoji is already in the reactions object
                if (existingReactions[emoji]) {
                    // If it is, check how many users have reacted to the message
                    const userCount = existingReactions[emoji].count

                    // If the user has already reacted, remove their reaction
                    if (userCount > 1) {
                        existingReactions[emoji].users = existingReactions[emoji].users.filter(u => u !== username)
                        existingReactions[emoji].count = existingReactions[emoji].count - 1
                    } else {
                        // If there is only one user, remove the reaction
                        delete existingReactions[emoji]
                    }
                } else {
                    // If it's not, add it
                    existingReactions[emoji] = {
                        reaction: emoji,
                        users: [username],
                        count: 1,
                        emoji_name: emoji_name ?? ''
                    }
                }
                return {
                    ...m,
                    message_reactions: JSON.stringify(existingReactions)
                }

            })

            return {
                message: {
                    has_new_messages: data?.message.has_new_messages ?? false,
                    has_old_messages: data?.message.has_old_messages ?? true,
                    messages: newMessages
                }
            }

        }

        return mutate({ path: `get_messages_for_channel_${message.channel_id}` }, async (data?: GetMessagesResponse) => {

            // Make the request
            return call.post('raven.api.reactions.react', {
                message_id: message.name,
                reaction: emoji,
                is_custom,
                emoji_name
            }).then(() => {
                return updateMessageWithReaction(data)
            })
        }, {
            optimisticData: (data?: GetMessagesResponse) => {
                return updateMessageWithReaction(data)
            },
            rollbackOnError: true,
            revalidate: false
        })
    }, [])

    return postReaction
}

export default usePostMessageReaction