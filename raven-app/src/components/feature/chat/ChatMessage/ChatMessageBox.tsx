import { Avatar, Box, BoxProps, Button, HStack, Stack, StackDivider, Text, Tooltip, useColorMode } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { User } from "../../../../types/User/User"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"
import { DateObjectToTimeString, DateObjectToFormattedDateStringWithoutYear } from "../../../../utils/operations"
import { ActionsPalette } from "../../message-action-palette/ActionsPalette"
import { MessageReactions } from "./MessageReactions"
import { Message, MessageBlock } from "../../../../types/Messaging/Message"
import { PreviousMessageBox } from "../MessageReply/PreviousMessageBox"

interface ChatMessageBoxProps extends BoxProps {
    message: Message,
    handleScroll?: (newState: boolean) => void,
    children?: React.ReactNode,
    onOpenUserDetailsDrawer?: (selectedUser: User) => void,
    handleScrollToMessage?: (name: string, channel: string, messages: MessageBlock[]) => void,
    replyToMessage?: (message: Message) => void
    mutate: () => void
}

export const ChatMessageBox = ({ message, onOpenUserDetailsDrawer, handleScroll, children, handleScrollToMessage, mutate, replyToMessage, ...props }: ChatMessageBoxProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })
    const { channelMembers, users } = useContext(ChannelContext)
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

            {is_continuation === 0 &&
                <HStack spacing={2} alignItems='flex-start'>
                    <Avatar name={channelMembers?.[user]?.full_name ?? users?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image ?? users?.[user]?.user_image} borderRadius={'md'} boxSize='36px' />
                    <Stack spacing='1'>
                        <HStack>
                            <HStack divider={<StackDivider />} align='flex-start'>
                                <Button variant='link' onClick={() => onOpenUserDetailsDrawer?.(channelMembers?.[user])}>
                                    <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[user]?.full_name ?? users?.[user]?.full_name ?? user}</Text>
                                </Button>
                                <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`} placement='top' rounded='md'>
                                    <Text fontSize="xs" lineHeight={'0.9'} color="gray.500" _hover={{ textDecoration: 'underline' }}>{DateObjectToTimeString(new Date(timestamp))}</Text>
                                </Tooltip>
                            </HStack>
                        </HStack>
                        {is_reply === 1 && linked_message &&
                            <PreviousMessageBox previous_message_id={linked_message} />
                        }
                        {children}
                        <MessageReactions message_reactions={message_reactions} name={name} />
                    </Stack>
                </HStack>
            }

            {is_continuation === 1 &&
                <HStack spacing={3.5}>
                    <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(new Date(timestamp))} at ${DateObjectToTimeString(new Date(timestamp))}`} placement='top' rounded='md'>
                        <Text pl='1' style={showButtons} fontSize={'xs'} color="gray.500" _hover={{ textDecoration: 'underline' }}>{DateObjectToTimeString(new Date(timestamp)).split(' ')[0]}</Text>
                    </Tooltip>
                    <Stack spacing='1' pt='0.5'>
                        {is_reply === 1 && linked_message &&
                            <PreviousMessageBox previous_message_id={linked_message} />
                        }
                        {children}
                        <MessageReactions name={name} message_reactions={message_reactions} />
                    </Stack>
                </HStack>
            }

            {message && handleScroll && <ActionsPalette
                message={message}
                showButtons={showButtons}
                handleScroll={handleScroll}
                is_continuation={is_continuation}
                replyToMessage={replyToMessage}
                mutate={mutate} />
            }

        </Box>
    )
}