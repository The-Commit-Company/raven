import { Avatar, Box, HStack, Link, Stack, StackDivider, Text, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import { useModalManager, ModalTypes } from "../../../hooks/useModalManager"
import { FileMessageBlock } from "../chat/ChatMessage/FileMessage"
import { FilePreviewModal } from "../file-preview/FilePreviewModal"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"

type MessageBoxProps = {
    messageName: string,
    channelName: string,
    channelID: string,
    isArchived: 1 | 0,
    creation: Date,
    owner: string,
    messageText: string,
    full_name?: string,
    user_image?: string,
    file?: string,
    message_type: 'Text' | 'File' | 'Image',
    handleScrollToMessage: (messageName: string, channelID: string) => void
}

export const MessageBox = ({ messageName, channelName, channelID, isArchived, creation, owner, messageText, full_name, user_image, file, message_type, handleScrollToMessage }: MessageBoxProps) => {

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
                <Avatar name={channelMembers?.[owner]?.full_name ?? users?.[owner]?.full_name ?? full_name ?? owner} src={channelMembers?.[owner]?.user_image ?? users?.[owner]?.user_image ?? user_image} borderRadius={'md'} boxSize='36px' />
                <Stack spacing='1'>
                    <HStack>
                        <HStack divider={<StackDivider />} align='flex-start'>
                            <Text fontSize='sm' lineHeight={'0.9'} fontWeight="bold" as='span' color={textColor}>{channelMembers?.[owner]?.full_name ?? users?.[owner]?.full_name ?? full_name ?? owner}</Text>
                        </HStack>
                    </HStack>
                    {message_type === 'Text' && <MarkdownRenderer content={messageText} />}
                    {file && (message_type === 'File' || message_type === 'Image') && <FileMessageBlock onFilePreviewModalOpen={onFilePreviewModalOpen} file={file} message_type={message_type} name={messageName} owner={owner} creation={creation} _liked_by={""} is_continuation={0} is_reply={0} />}
                </Stack>
            </HStack>
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                {...modalManager.modalContent}
            />
        </Box>
    )
}