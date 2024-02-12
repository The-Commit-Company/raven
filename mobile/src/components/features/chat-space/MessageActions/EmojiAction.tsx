import { useFrappePostCall } from "frappe-react-sdk"
import { BiBookAdd } from "react-icons/bi"
import { ActionProps } from "./common"
import { useCallback, useMemo } from "react"
import { ReactionObject } from "../chat-view/components/MessageReactions"


const STANDARD_EMOJIS = ['👍', '✅', '❤️', '🎉', '👀']
export const EmojiAction = ({ message, onSuccess }: ActionProps) => {

    const { data: { name: messageID, message_reactions } } = message
    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')

    const saveReaction = useCallback((emoji: string) => {
        return reactToMessage({
            message_id: messageID,
            reaction: emoji
        })
        // .then(() => updateMessages())
    }, [messageID, reactToMessage])

    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.values(parsed_json)
    }, [message_reactions])

    const hasReaction = (emoji: string) => {
        return reactions.some(r => r.reaction === emoji)
    }

    return (
        <div className="p-4 text-center grid grid-cols-6 gap-2">
            {STANDARD_EMOJIS.map(emoji => <QuickEmojiAction
                key={emoji}
                emoji={emoji} onClick={() => saveReaction(emoji)}
                isActive={hasReaction(emoji)} />)
            }
        </div>
    )
}


const QuickEmojiAction = ({ emoji, onClick, isActive = false }: { emoji: string, onClick: VoidFunction, isActive?: boolean }) => {
    return <div>
        <div
            role='button'
            className={"flex items-center flex-col"}
            onClick={onClick}>
            <span className="text-2xl block rounded-md w-9">{emoji}</span>
        </div>
    </div>
}

