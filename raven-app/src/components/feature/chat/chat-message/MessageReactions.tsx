import { HStack, Tag, Tooltip, useColorMode } from "@chakra-ui/react"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"
import { getUsers } from "../../../../utils/operations"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"

export const MessageReactions = ({ name, message_reactions, updateMessages }: { name: string, message_reactions?: string | null, updateMessages: VoidFunction }) => {

    const { colorMode } = useColorMode()
    const bgColor = colorMode === 'light' ? 'white' : 'gray.700'

    const { createDoc } = useFrappeCreateDoc()
    const { currentUser } = useContext(UserContext)

    const saveReaction = (emoji: string) => {
        if (name) {
            return createDoc('Raven Message Reaction', {
                reaction: emoji,
                user: currentUser,
                message: name
            })
                .then(() => updateMessages())
        }
    }

    const allUsers = useGetUserRecords()
    const reactions = JSON.parse(message_reactions ?? '{}')

    return (
        <HStack>
            {Object.keys(reactions).map((reaction) => {
                const { reaction: emoji, users, count } = reactions[reaction]
                const label = `${getUsers(users, count, currentUser, allUsers)} reacted with ${emoji}`
                return (
                    <Tooltip hasArrow label={label} placement='top' rounded='md' key={reaction} width={'fit-content'}>
                        <Tag
                            fontSize='xs'
                            variant='subtle'
                            _hover={{ cursor: 'pointer', border: '1px', borderColor: 'blue.500', backgroundColor: bgColor }}
                            onClick={() => saveReaction(reaction)}>
                            {emoji} {count}
                        </Tag>
                    </Tooltip>
                )
            })}
        </HStack>
    )
}