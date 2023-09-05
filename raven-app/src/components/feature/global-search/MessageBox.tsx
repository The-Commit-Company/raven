import { Avatar, Box, HStack, Link, Stack, StackDivider, Text, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import { useModalManager, ModalTypes } from "../../../hooks/useModalManager"
import { FileMessageBlock } from "../chat/chat-message/FileMessage"
import { FilePreviewModal } from "../file-preview/FilePreviewModal"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"

type MessageBoxProps = {
    messageName: string,
    channelID: string,
    creation: string,
    owner: string,
    messageText: string,
    file?: string,
    message_type: 'Text' | 'File' | 'Image',
    handleScrollToMessage: (messageName: string, channelID: string) => void
}

export const MessageBox = ({ messageName, channelID, creation, owner, messageText, file, message_type, handleScrollToMessage }: MessageBoxProps) => {

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.800' : 'gray.50'
    const [showButtons, setShowButtons] = useState<{}>({ visibility: 'hidden' })
    const modalManager = useModalManager()
    const onFilePreviewModalOpen = () => {
        modalManager.openModal(ModalTypes.FilePreview, {
            file: file,
            owner: owner,
            creation: creation,
            message_type: message_type
        })
    }

    const users = useGetUserRecords()
    const { channel } = useCurrentChannelData(channelID)
    const channelData = channel?.channelData as ChannelListItem
    const channelDMData = channel?.channelData as DMChannelListItem

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
                {channel?.type === 'channel' ? <Text fontSize='small' color='gray.500'>#{channelData?.channel_name}</Text> : <Text fontSize='small' color='gray.500'>Direct Message with {users[channelDMData.peer_user_id].full_name}</Text>}
                {channelData?.is_archived && <Text fontSize={'small'}>(archived)</Text>}
                <Text fontSize='small'>- {new Date(creation).toDateString()}</Text>
                <Link style={showButtons} color='blue.500' onClick={() => handleScrollToMessage(messageName, channelID)} pl={1}>
                    {channelData?.channel_name ? <Text fontSize={'small'}>View in channel</Text> : <Text fontSize={'small'}>View in chat</Text>}
                </Link>
            </HStack>
            <HStack spacing={2} alignItems='flex-start'>
                <Avatar name={users[owner]?.full_name ?? owner} src={users[owner]?.user_image ?? ''} borderRadius={'md'} boxSize='36px' />
                <Stack spacing='1'>
                    <HStack>
                        <HStack divider={<StackDivider />} align='flex-start'>
                            <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{users[owner]?.full_name ?? owner}</Text>
                        </HStack>
                    </HStack>
                    {message_type === 'Text' && <MarkdownRenderer content={messageText} />}
                    {file && (message_type === 'File' || message_type === 'Image') && <FileMessageBlock onFilePreviewModalOpen={onFilePreviewModalOpen} file={file} message_type={message_type} owner={owner} creation={creation} />}
                </Stack>
            </HStack>
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                channelMembers={users}
                {...modalManager.modalContent}
            />
        </Box>
    )
}