import { Box } from "@chakra-ui/react";
import { DividerWithText } from "../../layout/Divider/DividerWithText";
import { DateObjectToFormattedDateString } from "../../../utils/operations";
import { DateBlock, FileMessage, MessageBlock, MessagesWithDate } from "../../../types/Messaging/Message";
import { ChannelHistoryFirstMessage } from "../../layout/EmptyState/EmptyState";
import { useState } from "react";
import { ChatMessageBox } from "./ChatMessage/ChatMessageBox";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer";
import { FileMessageBlock } from "./ChatMessage/FileMessage";
import { UserProfileDrawer } from "../user-details/UserProfileDrawer";
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager";
import { User } from "../../../types/User/User";
import { FilePreviewModal } from "../file-preview/FilePreviewModal";
import { Virtuoso } from 'react-virtuoso';

interface ChatHistoryProps {
    parsed_messages: MessagesWithDate
    isDM: 1 | 0
}

export const ChatHistory = ({ parsed_messages, isDM }: ChatHistoryProps) => {

    const [isScrollable, setScrollable] = useState<boolean>(true)
    const handleScroll = (newState: boolean) => {
        setScrollable(newState)
    }

    const modalManager = useModalManager()

    const onOpenUserDetailsDrawer = (selectedUser: User) => {
        if (selectedUser) {
            modalManager.openModal(ModalTypes.UserDetails, selectedUser)
        }
    }

    const onFilePreviewModalOpen = (message: Partial<FileMessage>) => {
        if (message) {
            modalManager.openModal(ModalTypes.FilePreview, {
                file: message.file,
                owner: message.owner,
                creation: message.creation
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
                <div key={block.data.name}>
                    <ChatMessageBox message={block.data} handleScroll={handleScroll} onOpenUserDetailsDrawer={onOpenUserDetailsDrawer}>
                        {block.data.message_type === 'Text' && <MarkdownRenderer content={block.data.text} />}
                        {block.data.message_type === 'File' || block.data.message_type === 'Image' && <FileMessageBlock {...block.data} onFilePreviewModalOpen={onFilePreviewModalOpen} />}
                    </ChatMessageBox>
                </div>
            )
        }
        return null
    }

    return (
        <>
            <Virtuoso
                style={{ height: '100%', overflowY: isScrollable ? 'scroll' : 'hidden' }}
                totalCount={parsed_messages.length}
                itemContent={index => renderItem(parsed_messages[index])}
                initialTopMostItemIndex={parsed_messages.length - 1}
                components={{
                    Header: () => <ChannelHistoryFirstMessage isDM={isDM} />,
                }}
                alignToBottom={true}
                followOutput={'auto'}
            />

            <UserProfileDrawer
                isOpen={modalManager.modalType === ModalTypes.UserDetails}
                onClose={modalManager.closeModal}
                user={modalManager.modalContent}
            />

            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                message={modalManager.modalContent}
            />
        </>
    )
}