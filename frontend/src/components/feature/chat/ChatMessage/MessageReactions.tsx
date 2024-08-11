import { useFrappePostCall } from "frappe-react-sdk"
import { useCallback, useContext, useMemo } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"
import { getUsers, getUserImage } from "../../../../utils/operations"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Flex, IconButton, Text, Tooltip, Popover, Table, Badge, Avatar } from "@radix-ui/themes"
import { MdOutlineAnalytics } from "react-icons/md";
import { clsx } from "clsx"

interface ReactionObject {
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
        <Flex align="center" justify="between">
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
            <AnalyticsButton reactions={reactions} allUsers={allUsers} />
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

interface AnalyticsButtonProps {
    reactions: ReactionObject[],
    allUsers: Record<string, any>
}
const AnalyticsButton = ({ reactions, allUsers }: AnalyticsButtonProps) => {
    return (
        <Popover.Root >
            <Popover.Trigger>
                <IconButton 
                    size='1'
                    radius='large'
                    title="View Reaction Analytics"
                    className="cursor-pointer hover:bg-indigo-500 bg-indigo-600"
                >
                    <MdOutlineAnalytics />
                </IconButton>
            </Popover.Trigger>
            <Popover.Content size="1" width="500px">
                <Table.Root size="1" variant="ghost" layout="auto">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell justify="center">Reaction</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell justify="center">Count</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Users</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {reactions.map((reaction: any) => {
                            return (
                                <Table.Row align="center">
                                    <Table.Cell justify="center">{reaction["reaction"]}</Table.Cell>
                                    <Table.Cell justify="center">{reaction["count"]}</Table.Cell>
                                    <Table.Cell>
                                        <Flex gap="1" wrap="wrap">
                                            {reaction["users"].map((user: string) => {
                                                return (
                                                    <Badge size="1" radius="full" color="indigo">
                                                        <Avatar
                                                            size="1"
                                                            src={getUserImage(user, allUsers)}
                                                            fallback={user[0]}
                                                            className="-ml-0.5"
                                                        />
                                                        {user}
                                                    </Badge>
                                                )
                                            })}
                                        </Flex>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table.Root>
            </Popover.Content>
        </Popover.Root>
    )
}