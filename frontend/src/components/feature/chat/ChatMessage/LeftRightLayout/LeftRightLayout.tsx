import { UserFields } from "@/utils/users/UserListProvider"
import { Message } from "../../../../../../../types/Messaging/Message"

export interface Props {
    message: Message
    user: UserFields | undefined
    isActive: boolean
}

export const LeftRightLayout = ({ message, user, isActive }: Props) => {

    const { name, owner: userID, is_bot_message, bot, creation: timestamp, message_reactions, is_continuation, linked_message, replied_message_details } = message

    return (
        <>{message.text}</>
    )
}