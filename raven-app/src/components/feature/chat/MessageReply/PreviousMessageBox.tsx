import { Text, Box, HStack, Stack, useColorMode, Center, Image, Icon, IconButton, StackDivider, LinkBox } from '@chakra-ui/react'
import { Message } from '../../../../types/Messaging/Message'
import { MarkdownRenderer } from '../../markdown-viewer/MarkdownRenderer'
import { DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString, getFileExtension, getFileName } from '../../../../utils/operations'
import { useContext } from 'react'
import { ChannelContext } from '../../../../utils/channel/ChannelProvider'
import { getFileExtensionIcon } from '../../../../utils/layout/fileExtensionIcon'
import { IoMdClose } from 'react-icons/io'
import { useFrappeGetDoc, useFrappePostCall } from 'frappe-react-sdk'
import { AlertBanner } from '../../../layout/AlertBanner'
import { VirtuosoRefContext } from '../../../../utils/message/VirtuosoRefProvider'
import { useNavigate } from "react-router-dom"

interface PreviousMessageBoxProps {
    previous_message_id?: string,
    previous_message_content?: Message,
    onReplyingToMessageClose?: () => void
}

export const PreviousMessageBox = ({ previous_message_id, previous_message_content, onReplyingToMessageClose }: PreviousMessageBoxProps) => {

    const { colorMode } = useColorMode()
    const { channelMembers, users } = useContext(ChannelContext)
    const MAX_TRUNCATED_LENGTH = 100

    if (previous_message_content) {
        return (
            <Box m='2' bgColor={colorMode === 'light' ? 'gray.50' : 'black'} rounded={'md'}>
                <HStack w='full' p='2' rounded='md' justify="space-between">

                    <Stack spacing={1}>
                        <HStack divider={<StackDivider />}>
                            <Text fontSize='sm' fontWeight={'semibold'}>{channelMembers?.[previous_message_content.owner]?.full_name ?? users?.[previous_message_content.owner]?.full_name ?? previous_message_content.owner}</Text>
                            <HStack spacing={1}>
                                <Text fontSize='xs' color='gray.500'>{DateObjectToFormattedDateStringWithoutYear(new Date(previous_message_content.creation))}</Text>
                                <Text fontSize='xs' color='gray.500'>at</Text>
                                <Text fontSize='xs' color='gray.500'>{DateObjectToTimeString(new Date(previous_message_content.creation))}</Text>
                            </HStack>
                        </HStack>
                        {/* message content */}
                        {previous_message_content.message_type === 'Text' &&
                            <HStack spacing={0}>
                                <Stack>
                                    <MarkdownRenderer content={previous_message_content.text.slice(0, MAX_TRUNCATED_LENGTH)} />
                                </Stack>
                                {previous_message_content.text.length > MAX_TRUNCATED_LENGTH && <Text as="span" fontSize="sm">...</Text>}
                            </HStack>
                        }
                        {(previous_message_content.message_type === 'Image' || previous_message_content.message_type === 'File') &&
                            <HStack justify={'flex-start'}>
                                <Center maxW='50px'>
                                    {previous_message_content.message_type === 'Image' ?
                                        <Image src={previous_message_content.file} alt='File preview' boxSize={'30px'} rounded='md' /> :
                                        <Icon as={getFileExtensionIcon(getFileExtension(previous_message_content.file) ?? '')} boxSize="4" />}
                                </Center>
                                <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{getFileName(previous_message_content.file)}</Text>
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

    if (previous_message_id) {

        const { data, error } = useFrappeGetDoc<Message>('Raven Message', previous_message_id)
        const { virtuosoRef } = useContext(VirtuosoRefContext)
        const { channelData } = useContext(ChannelContext)
        const navigate = useNavigate()

        const { call, error: indexingError, reset } = useFrappePostCall<{ message: string }>("raven.raven_messaging.doctype.raven_message.raven_message.get_index_of_message")

        const handleNavigateToChannel = (channelID: string, _callback: VoidFunction) => {
            navigate(`/channel/${channelID}`)
            _callback()
        }

        const handleScrollToMessage = (messageName: string) => {
            reset()
            handleNavigateToChannel(channelData?.name ?? '', async function () {
                const result = await call({
                    channel_id: channelData?.name,
                    message_id: messageName
                })
                if (virtuosoRef) {
                    virtuosoRef.current?.scrollToIndex({ index: parseInt(result.message) ?? 'LAST', align: 'center' })
                }
            })
        }

        if (indexingError) {
            return <AlertBanner status='error' heading='error while searching for previous message' />
        }
        if (error) {
            return <AlertBanner status='error' heading='previous message not found, this message may have been deleted' />
        }
        if (data) {
            return <LinkBox onClick={() => handleScrollToMessage(previous_message_id)} p='2' border={'1px'} borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} rounded={'sm'} _hover={{ cursor: 'pointer', boxShadow: 'sm', bgColor: colorMode === 'light' ? 'white' : 'black' }}>
                <Box pl='2' borderLeft={'2px'} borderLeftColor={colorMode === 'light' ? 'gray.600' : 'gray.600'}>
                    <Stack spacing={1}>
                        <HStack>
                            <Text fontSize='xs' fontWeight={'semibold'} color='blue.500'>{channelMembers?.[data.owner]?.full_name ?? users?.[data.owner]?.full_name ?? data.owner}</Text>
                            <HStack spacing={1}>
                                <Text fontSize='2xs' color='gray.500'>{DateObjectToFormattedDateStringWithoutYear(new Date(data.creation))}</Text>
                                <Text fontSize='2xs' color='gray.500'>at</Text>
                                <Text fontSize='2xs' color='gray.500'>{DateObjectToTimeString(new Date(data.creation))}</Text>
                            </HStack>
                        </HStack>
                        {/* message content */}
                        {data.message_type === 'Text' &&
                            <HStack spacing={0}>
                                <Stack>
                                    <MarkdownRenderer content={data.text.slice(0, MAX_TRUNCATED_LENGTH)} />
                                </Stack>
                                {data.text.length > MAX_TRUNCATED_LENGTH && <Text as="span" fontSize="sm">...</Text>}
                            </HStack>
                        }
                        {(data.message_type === 'Image' || data.message_type === 'File') &&
                            <HStack justify={'flex-start'}>
                                <Center maxW='50px'>
                                    {data.message_type === 'Image' ?
                                        <Image src={data.file} alt='File preview' boxSize={'30px'} rounded='md' /> :
                                        <Icon as={getFileExtensionIcon(getFileExtension(data.file) ?? '')} boxSize="4" />}
                                </Center>
                                <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{getFileName(data.file)}</Text>
                            </HStack>
                        }
                    </Stack>
                </Box>
            </LinkBox>
        }
    }

    return null
}