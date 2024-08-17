import { useFrappePostCall } from "frappe-react-sdk"
import { useCallback, useContext, useMemo } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"
import { getUsers } from "../../../../utils/operations"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Flex, IconButton, Text, Tooltip } from "@radix-ui/themes"
import { clsx } from "clsx"

export interface ReactionObject {
    // The emoji
    reaction: string,
    // The users who reacted with this emoji
    users: string[],
    // The number of users who reacted with this emoji
    count: number
}
export const MessageReactions = ({ messageID, message_reactions }: { messageID: string, message_reactions?: string | null }) => {

    const { currentUser } = useContext(UserContext)

    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')

    const saveReaction = useCallback((emoji: string) => {
        if (messageID) {
            return reactToMessage({
                message_id: messageID,
                reaction: emoji
            })
        }
    }, [messageID, reactToMessage])

    const allUsers = useGetUserRecords()
    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.values(parsed_json)
    }, [message_reactions])

    return (
        <Flex gap='1' mt='1' wrap='wrap'>
            {reactions.map((reaction) => {
                return (
                    <ReactionButton
                        key={reaction.reaction}
                        reaction={reaction}
                        onReactionClick={saveReaction}
                        currentUser={currentUser}
                        allUsers={allUsers}
                    />
                )
            })}
        </Flex>
    )
}

interface ReactionButtonProps {
    reaction: ReactionObject,
    onReactionClick: (e: string) => void,
    currentUser: string,
    allUsers: Record<string, any>
}
const ReactionButton = ({ reaction, onReactionClick, currentUser, allUsers }: ReactionButtonProps) => {
    const { reaction: emoji, users, count } = reaction

    const onClick = useCallback(() => {
        onReactionClick(emoji)
    }, [onReactionClick, emoji])

    const { label, currentUserReacted } = useMemo(() => {
        return {
            label: `${getUsers(users, count, currentUser, allUsers)} reacted with ${emoji}`,
            currentUserReacted: users.includes(currentUser)
        }
    }, [allUsers, count, currentUser, reaction, users])

    return (
        <Tooltip content={<p className="my-0 max-w-96">
            {label}
        </p>}>
            <IconButton
                size='1'
                onClick={onClick}
                radius='large'
                className={clsx("w-fit sm:h-full text-xs py-0.5 cursor-pointer sm:hover:bg-white sm:dark:hover:bg-gray-10",
                    currentUserReacted ? "bg-accent-4 dark:bg-gray-7 font-bold" : "bg-gray-3 dark:bg-gray-4")}>
                <Text as='span' className={clsx("w-fit px-2 text-gray-12")}>
                    {emoji} {count}
                </Text>
            </IconButton>
        </Tooltip>
    )
}