import { useFrappePostCall } from "frappe-react-sdk"
import { useCallback, useContext, useMemo, useState } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"
import { getUsers } from "../../../../utils/operations"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Flex, IconButton, Text, Tooltip } from "@radix-ui/themes"
import { clsx } from "clsx"
import { EmojiPickerButton } from "./MessageActions/QuickActions/EmojiPickerButton"

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

    if (reactions.length === 0) return null

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
            <AddReactionButton
                saveReaction={saveReaction}
            />
        </Flex>
    )
}

const AddReactionButton = ({ saveReaction }: { saveReaction: (emoji: string) => void }) => {

    const [isOpen, setIsOpen] = useState(false)

    return <EmojiPickerButton
        saveReaction={saveReaction}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        iconButtonProps={{
            size: '1',
            className: 'bg-gray-3 dark:bg-gray-5 py-0.5 w-[3ch] text-gray-10 dark:text-gray-11 h-full rounded-md',
            variant: 'soft',
            color: 'gray'
        }}
        iconSize='15'
    />
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
            <button
                onClick={onClick}
                className={clsx("w-fit sm:h-full text-xs py-0.5 cursor-pointer rounded-md min-w-[5ch] border font-semibold",
                    currentUserReacted ? "bg-blue-50 border-blue-500 dark:border-gray-9 dark:bg-gray-7 sm:dark:hover:bg-gray-7" : "bg-gray-3 border-gray-3 sm:hover:bg-gray-2 sm:hover:border-gray-8 dark:bg-gray-5 sm:dark:hover:bg-gray-5 sm:dark:hover:border-gray-9")}>
                <Text as='span' className={clsx("block min-w-[3.5ch] tabular-nums text-gray-12", currentUserReacted ? "text-blue-800 dark:text-gray-12" : "text-gray-12")}>
                    {/* @ts-expect-error */}
                    <em-emoji native={emoji}></em-emoji> {count}
                </Text>
            </button>
        </Tooltip>
    )
}