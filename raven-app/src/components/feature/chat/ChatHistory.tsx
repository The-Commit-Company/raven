import { Box, useColorMode } from "@chakra-ui/react";
import { DividerWithText } from "../../layout/Divider/DividerWithText";
import { DateObjectToFormattedDateString } from "../../../utils/operations";
import { DateBlock, FileMessage, Message, MessageBlock, MessagesWithDate } from "../../../../../types/Messaging/Message";
import { ChannelHistoryFirstMessage } from "../../layout/EmptyState/EmptyState";
import { useContext, useRef, useState } from "react";
import { ChatMessageBox } from "./ChatMessage/ChatMessageBox";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer";
import { FileMessageBlock } from "./ChatMessage/FileMessage";
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager";
import { FilePreviewModal } from "../file-preview/FilePreviewModal";
import { Virtuoso } from 'react-virtuoso';
import { AnimatePresence, motion } from "framer-motion";
import { VirtuosoRefContext } from "../../../utils/message/VirtuosoRefProvider";
import { scrollbarStyles } from "../../../styles";
import { ChannelMembers, Member } from "@/pages/ChatSpace";

interface ChatHistoryProps {
    parsedMessages: MessagesWithDate,
    replyToMessage?: (message: Message) => void,
    updateMessages: () => void,
    channelID: string,
    channelMembers: ChannelMembers,
    updateMembers?: () => void
}

export const ChatHistory = ({ parsedMessages, updateMessages, replyToMessage, channelID, channelMembers, updateMembers }: ChatHistoryProps) => {

    const { colorMode } = useColorMode()

    const { virtuosoRef } = useContext(VirtuosoRefContext)

    const boxRef = useRef<HTMLDivElement>(null)

    const [isScrollable, setScrollable] = useState<boolean>(true)
    const handleScroll = (newState: boolean) => {
        setScrollable(newState)
    }

    const modalManager = useModalManager()

    const onFilePreviewModalOpen = (message: Partial<FileMessage>) => {
        if (message) {
            modalManager.openModal(ModalTypes.FilePreview, {
                file: message.file,
                owner: message.owner,
                creation: message.creation,
                message_type: message.message_type
            })
        }
    }

    const renderItem = (block: DateBlock | MessageBlock) => {
        if (block.block_type === 'date') {
            return (
                <Box p={4} key={block.data} zIndex={1} position={'relative'}>
                    <DividerWithText>{DateObjectToFormattedDateString(new Date(block.data))}</DividerWithText>
                </Box>
            )
        }
        if (block.block_type === 'message') {
            return (
                <AnimatePresence>
                    <motion.div key={block.data.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                        <ChatMessageBox
                            message={block.data}
                            handleScroll={handleScroll}
                            updateMessages={updateMessages}
                            replyToMessage={replyToMessage}
                            channelMembers={channelMembers}>
                            {block.data.message_type === 'Text' && <MarkdownRenderer content={block.data.text} />}
                            {(block.data.message_type === 'File' || block.data.message_type === 'Image') && <FileMessageBlock {...block.data} onFilePreviewModalOpen={onFilePreviewModalOpen} />}
                        </ChatMessageBox>
                    </motion.div>
                </AnimatePresence>
            )
        }
        return null
    }

    return (
        <Box ref={boxRef} h='100%' overflowY={isScrollable ? 'scroll' : 'hidden'} sx={scrollbarStyles(colorMode)}>
            <Virtuoso
                customScrollParent={boxRef.current ?? undefined}
                totalCount={parsedMessages.length}
                itemContent={index => renderItem(parsedMessages[index])}
                initialTopMostItemIndex={parsedMessages.length - 1}
                components={{
                    Header: () => <ChannelHistoryFirstMessage
                        channelID={channelID}
                        channelMembers={channelMembers}
                        updateMembers={updateMembers} />,
                }}
                ref={virtuosoRef}
                alignToBottom={true}
                followOutput={'auto'}
            />

            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                channelMembers={channelMembers}
                {...modalManager.modalContent}
            />
        </Box>
    )
}