import { Text, Box, HStack, Stack, useColorMode, Center, Image, Icon, IconButton, StackDivider } from '@chakra-ui/react'
import { Message } from '../../../../types/Messaging/Message'
import { MarkdownRenderer } from '../../markdown-viewer/MarkdownRenderer'
import { DateObjectToTimeString, getFileExtension, getFileName } from '../../../../utils/operations'
import { useContext } from 'react'
import { ChannelContext } from '../../../../utils/channel/ChannelProvider'
import { getFileExtensionIcon } from '../../../../utils/layout/fileExtensionIcon'
import { IoMdClose } from 'react-icons/io'

interface PreviousMessageBoxProps {
    message: Message,
    onReplyingToMessageClose: () => void
}

export const PreviousMessageBox = ({ message, onReplyingToMessageClose }: PreviousMessageBoxProps) => {

    const { colorMode } = useColorMode()
    const { channelMembers, users } = useContext(ChannelContext)
    const MAX_TRUNCATED_LENGTH = 100

    return (
        <Box m='2' bgColor={colorMode === 'light' ? 'gray.50' : 'black'} rounded={'md'}>
            <HStack w='full' p='2' rounded='md' justify="space-between">

                <Stack spacing={1}>
                    <HStack divider={<StackDivider />}>
                        <Text fontSize='sm' fontWeight={'semibold'}>{channelMembers?.[message.owner]?.full_name ?? users?.[message.owner]?.full_name ?? message.owner}</Text>
                        <Text fontSize='xs' color='gray.500'>{DateObjectToTimeString(new Date(message.creation))}</Text>
                    </HStack>
                    {/* message content */}
                    {message.message_type === 'Text' &&
                        <HStack spacing={0}>
                            <Stack>
                                <MarkdownRenderer content={message.text.slice(0, MAX_TRUNCATED_LENGTH)} />
                            </Stack>
                            {message.text.length > MAX_TRUNCATED_LENGTH && <Text as="span" fontSize="sm">...</Text>}
                        </HStack>
                    }
                    {(message.message_type === 'Image' || message.message_type === 'File') &&
                        <HStack justify={'flex-start'}>
                            <Center maxW='50px'>
                                {message.message_type === 'Image' ?
                                    <Image src={message.file} alt='File preview' boxSize={'30px'} rounded='md' /> :
                                    <Icon as={getFileExtensionIcon(getFileExtension(message.file) ?? '')} boxSize="4" />}
                            </Center>
                            <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{getFileName(message.file)}</Text>
                        </HStack>
                    }
                </Stack>

                <IconButton
                    onClick={onReplyingToMessageClose}
                    size="sm"
                    title='Remove message'
                    variant="ghost"
                    icon={<IoMdClose />}
                    aria-label="Remove message" />

            </HStack>
        </Box>
    )
}