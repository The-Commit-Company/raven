import { Stack, Box } from "@chakra-ui/react";
import { DividerWithText } from "../../layout/Divider/DividerWithText";
import { DateObjectToFormattedDateString } from "../../../utils/operations";
import { Message, MessagesWithDate } from "../../../types/Messaging/Message";
import { EmptyStateForChannel, EmptyStateForDM } from "../../layout/EmptyState/EmptyState";
import { useState } from "react";
import { ChatMessageBox } from "./ChatMessage/ChatMessageBox";
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer";
import { FileMessage } from "./ChatMessage/FileMessage";
import { ImageMessage } from "./ChatMessage/ImageMessage";
import { UserProfileDrawer } from "../user-details/UserProfileDrawer";
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager";
import { User } from "../../../types/User/User";
import { FilePreviewModal } from "../file-preview/FilePreviewModal";
import { ContinuationChatMessageBox } from "./ChatMessage/ContinuationChatMessage";

interface ChatHistoryProps {
    parsed_messages: MessagesWithDate,
    isDM: number,
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

    const onFilePreviewModalOpen = (message: Message) => {
        if (message) {
            modalManager.openModal(ModalTypes.FilePreview, message)
        }
    }

    return (
        <>
            <Stack spacing={0} justify="end" direction="column-reverse" overflowY={isScrollable ? "scroll" : "hidden"}>
                {parsed_messages.map((block) => {
                    switch (block.block_type) {
                        case 'date':
                            return (
                                <Box p={4} key={block.data}>
                                    <DividerWithText>{DateObjectToFormattedDateString(new Date(block.data))}</DividerWithText>
                                </Box>
                            )
                        case 'message':
                        case 'message_group':
                            return block.data.map((message: Message, index: number) => {
                                const isLastMessage = index === block.data.length - 1
                                const ChatMessageComponent = isLastMessage ? ChatMessageBox : ContinuationChatMessageBox
                                return (
                                    <ChatMessageComponent
                                        key={message.name}
                                        message={message}
                                        handleScroll={handleScroll}
                                        onOpenUserDetailsDrawer={onOpenUserDetailsDrawer}
                                    >
                                        {message.message_type === 'Text' && message.text && <MarkdownRenderer content={message.text} />}
                                        {message.message_type === 'File' && message.file && <FileMessage message={message} onFilePreviewModalOpen={onFilePreviewModalOpen} />}
                                        {message.message_type === 'Image' && message.file && <ImageMessage message={message} onFilePreviewModalOpen={onFilePreviewModalOpen} />}
                                    </ChatMessageComponent>
                                )
                            })
                        default:
                            return null
                    }
                })}
                {isDM === 1 ? <EmptyStateForDM /> : <EmptyStateForChannel />}
            </Stack>
            <UserProfileDrawer
                isOpen={modalManager.modalType === ModalTypes.UserDetails}
                onClose={modalManager.closeModal}
                user={modalManager.modalContext}
            />
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                message={modalManager.modalContext}
            />
        </>
    )
}