import { Avatar, Box, BoxProps, HStack, Stack, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import { ActionsPalette } from "../../message-action-palette/ActionsPalette"
import { MessageReactions } from "./MessageReactions"
import { Message, MessageBlock } from "../../../../../../types/Messaging/Message"
import { PreviousMessageBox } from "../MessageReply/PreviousMessageBox"
import { ChannelMembers } from "@/pages/ChatSpace"
import { DateTooltipShort } from "./DateTooltip"
import { UserNameInMessage } from "./UserNameInMessage"

interface ChatMessageBoxProps extends BoxProps {
    message: Message,
    handleScroll?: (newState: boolean) => void,
    children?: React.ReactNode,
    handleScrollToMessage?: (name: string, channel: string, messages: MessageBlock[]) => void,
    replyToMessage?: (message: Message) => void
    updateMessages: () => void,
    channelMembers: ChannelMembers
}

export const ChatMessageBox = ({ message, handleScroll, children, handleScrollToMessage, updateMessages, replyToMessage, channelMembers, ...props }: ChatMessageBoxProps) => {

    const { colorMode } = useColorMode()
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })
    const { name, owner: user, creation: timestamp, message_reactions, is_continuation, is_reply, linked_message } = message

    return (
        <Box
            pt={is_continuation === 0 ? '2' : '1'}
            pb='1'
            px='2'
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

            <HStack spacing={is_continuation === 0 ? 2 : 3.5} alignItems={is_continuation === 0 ? 'flex-start' : 'center'}>
                {is_continuation === 0 ?
                    <Avatar name={channelMembers?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image ?? ''} borderRadius={'md'} boxSize='36px' /> :
                    <DateTooltipShort timestamp={timestamp} showButtons={showButtons} />
                }
                <Stack spacing='1' pt={is_continuation === 0 ? 0 : 0.5}>
                    {is_continuation === 0 && <UserNameInMessage timestamp={timestamp} user={user} channelMembers={channelMembers} />}
                    {is_reply === 1 && linked_message &&
                        <PreviousMessageBox previous_message_id={linked_message} />
                    }
                    {children}
                    <MessageReactions message_reactions={message_reactions} name={name} />
                </Stack>
            </HStack>

            {message && handleScroll && <ActionsPalette
                message={message}
                showButtons={showButtons}
                handleScroll={handleScroll}
                is_continuation={is_continuation}
                replyToMessage={replyToMessage}
                updateMessages={updateMessages} />
            }

        </Box>
    )
}