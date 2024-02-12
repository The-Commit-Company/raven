import { useCallback, useMemo } from "react"
import { useFrappePostCall } from "frappe-react-sdk"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"

export interface ReactionObject {
    // The emoji
    reaction: string,
    // The users who reacted with this emoji
    users: string[],
    // The number of users who reacted with this emoji
    count: number
}
const MessageReactions = ({ messageID, message_reactions }: { messageID: string, message_reactions?: string | null }) => {

    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')

    const saveReaction = useCallback((emoji: string) => {
        return reactToMessage({
            message_id: messageID,
            reaction: emoji
        })
        // .then(() => updateMessages())
    }, [messageID, reactToMessage])

    const allUsers = useGetUserRecords()
    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.values(parsed_json)
    }, [message_reactions])

    return <div className="flex gap-2">
        {reactions.map((reaction) => <ReactionButton key={reaction.reaction} reaction={reaction} onReactionClick={saveReaction} allUsers={allUsers} />)}
    </div>
}

interface ReactionButtonProps {
    reaction: ReactionObject,
    onReactionClick: (e: string) => void,
    allUsers: Record<string, any>
}
const ReactionButton = ({ reaction, onReactionClick, allUsers }: ReactionButtonProps) => {

    const { count, reaction: emoji } = reaction

    return <div
        role='button'
        onClick={() => onReactionClick(emoji)}
        className="bg-zinc-800 px-1.5 py-0.5 rounded-md flex items-center justify-center gap-1">
        <span className="font-bold text-sm">
            {emoji}
        </span>
        <span className="font-bold text-xs text-gray-100">
            {count}
        </span>

    </div>
}

export default MessageReactions

MessageReactions.displayName = 'MessageReactions'