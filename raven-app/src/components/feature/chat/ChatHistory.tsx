import { Stack } from "@chakra-ui/react"
import { DividerWithText } from "../../layout/Divider/DividerWithText"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { Message, MessagesWithDate } from "../../../types/Messaging/Message"
import { EmptyStateForChannel, EmptyStateForDM } from "../../layout/EmptyState/EmptyState"
import { useState } from "react"
import { ChatMessageBox } from "./ChatMessage/ChatMessageBox"
import { MarkdownRenderer } from "../markdown-viewer/MarkdownRenderer"
import { FileMessage } from "./ChatMessage/FileMessage"
import { ImageMessage } from "./ChatMessage/ImageMessage"
import { UserProfileDrawer } from "../user-details/UserProfileDrawer"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { User } from "../../../types/User/User"
import { FilePreviewModal } from "../file-preview/FilePreviewModal"

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
        <Stack spacing={4} justify="end" direction={"column-reverse"} overflowY={isScrollable ? "scroll" : "hidden"}>
            {Object.entries(parsed_messages).reverse().map(([date, messages]) => (
                <Stack spacing={4} key={date}>
                    <DividerWithText>
                        {DateObjectToFormattedDateString(new Date(date))}
                    </DividerWithText>
                    <Stack spacing={0}>
                        {messages.map((message: Message) => (
                            <ChatMessageBox
                                key={message.name}
                                message={message}
                                handleScroll={handleScroll}
                                onOpenUserDetailsDrawer={onOpenUserDetailsDrawer}
                            >
                                {message.message_type === 'Text' && message.text &&
                                    <MarkdownRenderer content={message.text} />
                                }
                                {message.message_type === 'File' && message.file &&
                                    <FileMessage message={message} onFilePreviewModalOpen={onFilePreviewModalOpen} />
                                }
                                {message.message_type === 'Image' && message.file &&
                                    <ImageMessage message={message} onFilePreviewModalOpen={onFilePreviewModalOpen} />
                                }
                            </ChatMessageBox>
                        ))}
                    </Stack>
                </Stack>
            ))}
            {isDM === 1 ? <EmptyStateForDM /> : <EmptyStateForChannel />}
            <UserProfileDrawer
                isOpen={modalManager.modalType === ModalTypes.UserDetails}
                onClose={modalManager.closeModal}
                user={modalManager.modalContext} />
            <FilePreviewModal
                isOpen={modalManager.modalType === ModalTypes.FilePreview}
                onClose={modalManager.closeModal}
                message={modalManager.modalContext}
            />
        </Stack>
    )
}
