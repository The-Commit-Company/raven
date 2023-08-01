import { useFrappeCreateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { getUsers } from "../../../../../raven-app/src/utils/operations"
import { ChannelContext } from "../../../pages/channels/ViewChannel"
import { IonBadge } from "@ionic/react"
import { UserContext } from "../../../utils/auth/UserProvider"

export const MessageReactions = ({ name, message_reactions }: { name: string, message_reactions?: string | null }) => {

    const { createDoc } = useFrappeCreateDoc()
    const { currentUser } = useContext(UserContext)

    const saveReaction = (emoji: string) => {
        if (name) return createDoc('Raven Message Reaction', {
            reaction: emoji,
            user: currentUser,
            message: name
        })
    }

    const reactions = JSON.parse(message_reactions ?? '{}')
    const { users: allUsers } = useContext(ChannelContext)

    return (
        <div>
            {Object.keys(reactions).map((reaction) => {
                const { reaction: emoji, users, count } = reactions[reaction]
                const label = `${getUsers(users, count, currentUser, allUsers)} reacted with ${emoji}`
                return (
                    <IonBadge
                        onClick={() => saveReaction(reaction)}
                    >
                        {emoji} {count}
                    </IonBadge>
                )
            })}
        </div>
    )
}