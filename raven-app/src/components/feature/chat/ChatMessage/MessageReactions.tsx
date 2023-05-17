import { HStack, Tag, useColorMode } from "@chakra-ui/react"
import { useFrappeCreateDoc } from "frappe-react-sdk"
import { useContext } from "react"
import { UserContext } from "../../../../utils/auth/UserProvider"

export const MessageReactions = ({ name, message_reactions }: { name: string, message_reactions?: string | null }) => {

    const { colorMode } = useColorMode()
    const bgColor = colorMode === 'light' ? 'white' : 'gray.700'

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

    return <HStack>
        {Object.keys(reactions).map((reaction, index) => {
            return <Tag
                fontSize='xs'
                variant='subtle'
                _hover={{ cursor: 'pointer', border: '1px', borderColor: 'blue.500', backgroundColor: bgColor }}
                key={index}
                onClick={() => saveReaction(reaction)}>
                {reaction} {reactions[reaction]}
            </Tag>
        })}
    </HStack>
}