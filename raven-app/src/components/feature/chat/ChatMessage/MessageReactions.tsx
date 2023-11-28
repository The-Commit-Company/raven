import { HStack, Tag, Tooltip } from "@chakra-ui/react"
import { useFrappePostCall } from "frappe-react-sdk"
import { useCallback, useContext, useMemo } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"
import { getUsers } from "../../../../utils/operations"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { useColorModeValue } from "@/ThemeProvider"

interface ReactionObject {
    // The emoji
    reaction: string,
    // The users who reacted with this emoji
    users: string[],
    // The number of users who reacted with this emoji
    count: number
}
export const MessageReactions = ({ name, message_reactions, updateMessages }: { name: string, message_reactions?: string | null, updateMessages: VoidFunction }) => {

    const { currentUser } = useContext(UserContext)

    const { call: reactToMessage } = useFrappePostCall('raven.api.reactions.react')

    const saveReaction = useCallback((emoji: string) => {
        if (name) {
            return reactToMessage({
                message_id: name,
                reaction: emoji
            }).then(() => updateMessages())
        }
    }, [name, updateMessages, reactToMessage])

    const allUsers = useGetUserRecords()
    const reactions: ReactionObject[] = useMemo(() => {
        //Parse the string to a JSON object and get an array of reactions
        const parsed_json = JSON.parse(message_reactions ?? '{}') as Record<string, ReactionObject>
        return Object.values(parsed_json)
    }, [message_reactions])

    return (
        <HStack>
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
        </HStack>
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
    const bgColor = useColorModeValue('white', 'gray.700')
    const activeBorderColor = useColorModeValue('gray.200', 'gray.600')

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
        <Tooltip hasArrow label={label} placement='top' rounded='md' key={emoji} width={'fit-content'}>
            <Tag
                fontSize='xs'
                borderWidth='1px'
                borderColor='transparent'
                bgColor={currentUserReacted ? activeBorderColor : 'auto'}
                variant='subtle'
                _hover={{ cursor: 'pointer', border: '1px', borderColor: 'blue.500', backgroundColor: bgColor }}
                onClick={onClick}>
                {emoji} {count}
            </Tag>
        </Tooltip>
    )
}