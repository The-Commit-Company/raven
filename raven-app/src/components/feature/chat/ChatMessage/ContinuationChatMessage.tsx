import { HStack, Stack, Tooltip, Text, Box, BoxProps, useColorMode } from "@chakra-ui/react"
import { Message } from "../../../../types/Messaging/Message"
import { MessageReactions } from "./MessageReactions"
import { DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString } from "../../../../utils/operations"
import { ActionsPalette } from "../../message-action-palette/ActionsPalette"
import { useState } from "react"

interface ContinuationChatMessageBoxProps extends BoxProps {
    message: Message,
    children: React.ReactNode,
    handleScroll?: (newState: boolean) => void
}

export const ContinuationChatMessageBox = ({ message, children, handleScroll, ...props }: ContinuationChatMessageBoxProps) => {

    const { name, text, file, owner: user, creation: timestamp, message_reactions } = message
    const { colorMode } = useColorMode()
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })

    return (
        <Box
            px='2'
            py='1'
            zIndex={1}
            position={'relative'}
            _hover={{
                bg: colorMode === 'light' && 'gray.50' || 'gray.800',
                borderRadius: 'md'
            }}
            rounded='md'
            onMouseEnter={e => {
                setShowButtons({ visibility: 'visible' })
            }}
            onMouseLeave={e => {
                setShowButtons({ visibility: 'hidden' })
            }}
            {...props}>
            <HStack spacing={3.5}>
                <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`} placement='top' rounded='md'>
                    <Text pl='1' style={showButtons} fontSize={'xs'} color="gray.500" _hover={{ textDecoration: 'underline' }}>{DateObjectToTimeString(new Date(timestamp)).split(' ')[0]}</Text>
                </Tooltip>
                <Stack spacing='1' pt='0.5'>
                    {children}
                    <MessageReactions name={name} message_reactions={message_reactions} />
                </Stack>
            </HStack>
            {message && handleScroll && <ActionsPalette name={name} file={file} text={text} user={user} showButtons={showButtons} handleScroll={handleScroll} />}
        </Box>
    )
}