import { Avatar, Box, BoxProps, Button, HStack, Link, Stack, StackDivider, Text, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { User } from "../../../../types/User/User"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"
import { DateObjectToTimeString, DateObjectToFormattedDateStringWithoutYear } from "../../../../utils/operations"
import { MarkdownRenderer } from "../../markdown-viewer/MarkdownRenderer"
import { UserProfileDrawer } from "../../user-details/UserProfileDrawer"
import { ActionsPalette } from "../../message-action-palette/ActionsPalette"
import { useNavigate } from "react-router-dom";
import { ImageMessage } from "./ImageMessage"
import { FileMessage } from "./FileMessage"
import { MessageReactions } from "./MessageReactions"

interface ChatMessageProps extends BoxProps {
    name: string,
    user: string,
    timestamp: Date,
    text?: string | null,
    image?: string | null,
    file?: string | null,
    message_reactions?: string | null,
    isContinuation?: boolean | null,
    isSearchResult?: boolean,
    creation?: string
    channelName?: string
    channelID?: string
    handleScroll?: (newState: boolean) => void
}

export const ChatMessage = ({ name, user, timestamp, text, image, file, isContinuation, isSearchResult, creation, channelName, channelID, message_reactions, handleScroll, ...props }: ChatMessageProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })

    const { channelMembers, users } = useContext(ChannelContext)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const navigate = useNavigate()

    const { isOpen: isUserProfileDetailsDrawerOpen, onOpen: onUserProfileDetailsDrawerOpen, onClose: onUserProfileDetailsDrawerClose } = useDisclosure()

    return (
        <Box
            pt={isContinuation ? 2 : 4}
            pb={2}
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
            {isSearchResult && creation && <HStack pb={1.5} spacing={1}>
                <Text fontWeight='semibold' fontSize='sm'>{channelName ?? "Direct message"}</Text>
                <Text fontSize='small'>- {new Date(creation).toDateString()}</Text>
                <Link style={showButtons} color='blue.500' onClick={() => navigate(`/channel/${channelID}`)} pl={1}>{channelName ? <Text fontSize={'small'}>View Channel</Text> : <Text fontSize={'small'}>View Chat</Text>}</Link>
            </HStack>}
            {isContinuation ?
                <HStack spacing={3}>
                    <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(timestamp)} at ${DateObjectToTimeString(timestamp)}`} placement='top' rounded='md'>
                        <Text pl='1' style={showButtons} fontSize={'xs'} color="gray.500" _hover={{ textDecoration: 'underline' }}>{DateObjectToTimeString(timestamp).split(' ')[0]}</Text>
                    </Tooltip>
                    <Stack spacing='1'>
                        <DisplayMessageContent text={text} image={image} file={file} user={user} timestamp={timestamp} />
                        <MessageReactions name={name} message_reactions={message_reactions} />
                    </Stack>
                </HStack>
                : <HStack spacing={2} alignItems='flex-start'>
                    <Avatar name={channelMembers?.[user]?.full_name ?? users?.[user]?.full_name ?? user} src={channelMembers?.[user]?.user_image ?? users?.[user]?.user_image} borderRadius={'md'} boxSize='36px' />
                    <Stack spacing='1'>
                        <HStack>
                            <HStack divider={<StackDivider />} align='flex-start'>
                                <Button variant='link' onClick={() => {
                                    setSelectedUser(channelMembers?.[user])
                                    onUserProfileDetailsDrawerOpen()
                                }}>
                                    <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[user]?.full_name ?? users?.[user]?.full_name ?? user}</Text>
                                </Button>
                                <Tooltip hasArrow label={`${DateObjectToFormattedDateStringWithoutYear(timestamp)} at ${DateObjectToTimeString(timestamp)}`} placement='top' rounded='md'>
                                    <Text fontSize="xs" lineHeight={'0.9'} color="gray.500" _hover={{ textDecoration: 'underline' }}>{DateObjectToTimeString(timestamp)}</Text>
                                </Tooltip>
                            </HStack>
                        </HStack>
                        <DisplayMessageContent text={text} image={image} file={file} user={user} timestamp={timestamp} />
                        {message_reactions && <MessageReactions name={name} message_reactions={message_reactions} />}
                    </Stack>
                </HStack>
            }
            {handleScroll && <ActionsPalette name={name} text={text} image={image} file={file} user={user} showButtons={showButtons} handleScroll={handleScroll} />}
            {selectedUser && <UserProfileDrawer isOpen={isUserProfileDetailsDrawerOpen} onClose={onUserProfileDetailsDrawerClose} user={selectedUser} />}
        </Box>
    )
}

interface DisplayMessageContentProps {
    text?: string | null,
    image?: string | null,
    file?: string | null,
    user: string,
    timestamp: Date,
}

const DisplayMessageContent = ({ text, image, file, user, timestamp }: DisplayMessageContentProps) => {
    if (text) {
        return <MarkdownRenderer content={text} />
    }
    else if (image) {
        return <ImageMessage image={image} user={user} timestamp={timestamp} />
    }
    else if (file) {
        return <FileMessage file={file} user={user} timestamp={timestamp} />
    }
    return null
}
