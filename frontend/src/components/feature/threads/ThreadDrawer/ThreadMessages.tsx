import { IconButton, Flex, Box } from "@radix-ui/themes"
import { useState } from "react"
import { BiX } from "react-icons/bi"
import useFileUpload from "../../chat/ChatInput/FileInput/useFileUpload"
import Tiptap from "../../chat/ChatInput/Tiptap"
import { useSendMessage } from "../../chat/ChatInput/useSendMessage"
import { ReplyMessageBox } from "../../chat/ChatMessage/ReplyMessageBox/ReplyMessageBox"
import { CustomFile } from "../../file-upload/FileDrop"
import { FileListItem } from "../../file-upload/FileListItem"
import { useParams } from "react-router-dom"
import ThreadStream from "./ThreadStream"
import { Message } from "../../../../../../types/Messaging/Message"

export const ThreadMessages = () => {

    const { threadID, channelID } = useParams()

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }

    const { fileInputRef, files, setFiles, removeFile, uploadFiles, addFile, fileUploadProgress } = useFileUpload(channelID ?? '')

    const { sendMessage, loading } = useSendMessage(threadID ?? '', files.length, uploadFiles, handleCancelReply, selectedMessage)

    const PreviousMessagePreview = ({ selectedMessage }: { selectedMessage: any }) => {

        if (selectedMessage) {
            return <ReplyMessageBox
                justify='between'
                align='center'
                className="m-2"
                message={selectedMessage}>
                <IconButton
                    color='gray'
                    size='1'
                    variant="soft"
                    onClick={handleCancelReply}>
                    <BiX size='20' />
                </IconButton>
            </ReplyMessageBox>
        }
        return null
    }

    return (
        <Flex direction='column' justify={'between'} gap='0' className="h-full p-4">
            <ThreadStream replyToMessage={handleReplyAction} />
            <Tiptap
                key={threadID}
                fileProps={{
                    fileInputRef,
                    addFile
                }}
                clearReplyMessage={handleCancelReply}
                replyMessage={selectedMessage}
                sessionStorageKey={`tiptap-${threadID}`}
                onMessageSend={sendMessage}
                messageSending={loading}
                slotBefore={<Flex direction='column' justify='center' hidden={!selectedMessage && !files.length}>
                    {selectedMessage && <PreviousMessagePreview selectedMessage={selectedMessage} />}
                    {files && files.length > 0 && <Flex gap='2' width='100%' align='end' px='2' p='2' wrap='wrap'>
                        {files.map((f: CustomFile) => <Box className="grow-0" key={f.fileID}><FileListItem file={f} uploadProgress={fileUploadProgress} removeFile={() => removeFile(f.fileID)} /></Box>)}
                    </Flex>}
                </Flex>}
            />
        </Flex>
    )
}