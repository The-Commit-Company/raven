import { useCallback, useContext, useMemo } from "react"
import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { IonButton } from "@ionic/react"
import { UserContext } from "@/utils/auth/UserProvider"

export interface ReactionObject {
    // The emoji
    reaction: string,
    // The users who reacted with this emoji
    users: string[],
    // The number of users who reacted with this emoji
    count: number
}
const MessageReactions = ({ messageID, channelID, message_reactions }: { messageID: string, channelID: string, message_reactions?: string | null }) => {

    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')
    const { mutate } = useSWRConfig()

    const saveReaction = useCallback((emoji: string) => {
        Haptics.impact({
            style: ImpactStyle.Light
        })
        return reactToMessage({
            message_id: messageID,
            reaction: emoji
        })
            .then(() => mutate(`get_messages_for_channel_${channelID}`))
        // .then(() => updateMessages())
    }, [messageID, reactToMessage])

    const allUsers = useGetUserRecords()
    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>

        const allReactions = Object.values(parsed_json)

        if (allReactions.length > 8) {
            const firstEight = allReactions.slice(0, 8)
            const others = allReactions.slice(8)
            return firstEight.concat({ reaction: `${others.length} more...`, users: [], count: 0 })
        } else {
            return allReactions
        }

    }, [message_reactions])

    return <div className="flex gap-x-1.5 flex-wrap">
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

    const { currentUser } = useContext(UserContext)

    const currentUserReacted = useMemo(() => {
        return reaction.users.includes(currentUser)
    }, [reaction.users, currentUser])

    const onClick = useCallback(() => {
        onReactionClick(emoji)
    }, [emoji])

    const className = "active:bg-zinc-700 rounded-md flex items-center justify-center border " + (currentUserReacted ? "border-iris-8 bg-iris-2" : "border-transparent bg-zinc-800")

    return <IonButton
        size='small'
        type="button"
        fill='clear'
        buttonType="button"
        className={className}
        onClick={onClick}
    >
        <span className="font-bold block text-xs text-gray-300">
            {emoji}
        </span>
        {count ?
            <span className="font-bold block text-xs text-gray-100 pl-1">
                {count}
            </span> : null
        }
    </IonButton>
}

export default MessageReactions

MessageReactions.displayName = 'MessageReactions'