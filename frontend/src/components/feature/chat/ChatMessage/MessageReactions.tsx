import { useFrappePostCall } from "frappe-react-sdk"
import { useCallback, useContext, useMemo, useState } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"
import { getUsers } from "../../../../utils/operations"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Flex, Text, Tooltip } from "@radix-ui/themes"
import { clsx } from "clsx"
import { EmojiPickerButton } from "./MessageActions/QuickActions/EmojiPickerButton"
import usePostMessageReaction from "@/hooks/usePostMessageReaction"
import { Message } from "../../../../../../types/Messaging/Message"
import { toast } from "sonner"
import { getErrorMessage } from "@/components/layout/AlertBanner/ErrorBanner"

export interface ReactionObject {
    // The emoji
    reaction: string,
    // The users who reacted with this emoji
    users: string[],
    // The number of users who reacted with this emoji
    count: number,
    // Whether the emoji is a custom emoji
    is_custom?: boolean,
    // The name of the custom emoji
    emoji_name: string
}
export const MessageReactions = ({ message, message_reactions }: { message: Message, message_reactions?: string | null }) => {

    const { currentUser } = useContext(UserContext)

    const postReaction = usePostMessageReaction()

    const saveReaction = useCallback((emoji: string, is_custom: boolean = false, emoji_name?: string) => {
        if (message) {
            postReaction(message, emoji, is_custom, emoji_name)
                .catch((err) => {
                    toast.error("Could not react to message.", {
                        description: getErrorMessage(err)
                    })
                })
        }
    }, [message])

    const allUsers = useGetUserRecords()
    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.entries(parsed_json).map(([key, value]) => ({
            ...value,
            emoji_name: key
        }))
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

const AddReactionButton = ({ saveReaction }: { saveReaction: (emoji: string, is_custom: boolean, emoji_name?: string) => void }) => {

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
    onReactionClick: (e: string, is_custom?: boolean, emoji_name?: string) => void,
    currentUser: string,
    allUsers: Record<string, any>
}
const ReactionButton = ({ reaction, onReactionClick, currentUser, allUsers }: ReactionButtonProps) => {
    const { reaction: emoji, users, count, emoji_name } = reaction

    const onClick = useCallback(() => {
        onReactionClick(emoji, reaction.is_custom, emoji_name)
    }, [onReactionClick, emoji])

    const { label, currentUserReacted } = useMemo(() => {
        return {
            label: `${getUsers(users, count, currentUser, allUsers)} reacted with ${emoji_name}`,
            currentUserReacted: users.includes(currentUser)
        }
    }, [allUsers, count, currentUser, reaction, users])

    return (
        <Tooltip content={<span className="my-0 max-w-96">
            {label}
        </span>}>
            <button
                onClick={onClick}
                className={clsx("w-fit sm:h-full text-xs py-0.5 cursor-pointer rounded-md min-w-[4ch] border font-semibold",
                    currentUserReacted ? "bg-blue-50 border-blue-500 dark:border-gray-9 dark:bg-gray-7 sm:dark:hover:bg-gray-7" : "bg-gray-3 border-gray-3 sm:hover:bg-gray-2 sm:hover:border-gray-8 dark:bg-gray-5 sm:dark:hover:bg-gray-5 sm:dark:hover:border-gray-9")}>
                <Text as='span' className={clsx("flex items-center gap-1 min-w-[3ch] tabular-nums h-[1.2rem] text-gray-12", currentUserReacted ? "text-blue-800 dark:text-gray-12" : "text-gray-12")}>
                    {reaction.is_custom ? <img src={emoji} alt={emoji}
                        loading="lazy"
                        className="w-[1.1rem] h-[1.1rem] object-contain object-center" /> :
                        <span className="-mb-1 w-[1.1rem] h-[1.1rem]">
                            {/* @ts-expect-error */}
                            <em-emoji native={emoji} set='apple' size='1.2em'></em-emoji>
                        </span>
                    }
                    {count}
                </Text>
            </button>
        </Tooltip>
    )
}