import { Avatar, Box, HStack, Link, Stack, StackDivider, Text, useColorMode } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"

type MessageBoxProps = {
    messageName: string,
    channelName: string,
    channelID: string,
    isArchived: 1 | 0,
    creation: Date,
    owner: string,
    messageText: string,
    handleScrollToMessage: (messageName: string, channelID: string) => void
}

export const MessageBox = ({ messageName, channelName, channelID, isArchived, creation, owner, messageText, handleScrollToMessage }: MessageBoxProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })
    const { channelMembers, users } = useContext(ChannelContext)

    return (
        <Box
            key={messageName}
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
            }}>
            <HStack pb={1.5} spacing={1}>
                <Text fontWeight='semibold' fontSize='sm'>{channelName ?? "Direct message"}</Text>
                {isArchived && <Text fontSize={'small'}>(archived)</Text>}
                <Text fontSize='small'>- {new Date(creation).toDateString()}</Text>
                <Link style={showButtons} color='blue.500' onClick={() => handleScrollToMessage(messageName, channelID)} pl={1}>
                    {channelName ? <Text fontSize={'small'}>View in channel</Text> : <Text fontSize={'small'}>View in chat</Text>}
                </Link>
            </HStack>
            <HStack spacing={2} alignItems='flex-start'>
                <Avatar name={channelMembers?.[owner]?.full_name ?? users?.[owner]?.full_name ?? owner} src={channelMembers?.[owner]?.user_image ?? users?.[owner]?.user_image} borderRadius={'md'} boxSize='36px' />
                <Stack spacing='1'>
                    <HStack>
                        <HStack divider={<StackDivider />} align='flex-start'>
                            <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[owner]?.full_name ?? users?.[owner]?.full_name ?? owner}</Text>
                        </HStack>
                    </HStack>
                    {messageText && <MarkdownRenderer content={messageText} />}
                </Stack>
            </HStack>
        </Box>
    )
}