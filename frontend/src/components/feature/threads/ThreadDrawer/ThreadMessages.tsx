import { IconButton, Flex, Box } from "@radix-ui/themes"
import { useMemo, useState } from "react"
import { BiX } from "react-icons/bi"
import useFileUpload from "../../chat/ChatInput/FileInput/useFileUpload"
import Tiptap from "../../chat/ChatInput/Tiptap"
import { useSendMessage } from "../../chat/ChatInput/useSendMessage"
import { ReplyMessageBox } from "../../chat/ChatMessage/ReplyMessageBox/ReplyMessageBox"
import { CustomFile, FileDrop } from "../../file-upload/FileDrop"
import { FileListItem } from "../../file-upload/FileListItem"
import { useParams } from "react-router-dom"
import { Message } from "../../../../../../types/Messaging/Message"
import ChatStream from "../../chat/ChatStream/ChatStream"
import { JoinChannelBox } from "../../chat/chat-footer/JoinChannelBox"
import { useUserData } from "@/hooks/useUserData"
import useFetchChannelMembers from "@/hooks/fetchers/useFetchChannelMembers"
import ThreadFirstMessage from "./ThreadFirstMessage"
import AIEvent from "../../ai/AIEvent"
import { useTyping } from "../../chat/ChatInput/TypingIndicator/useTypingIndicator"
import TypingIndicator from "../../chat/ChatInput/TypingIndicator/TypingIndicator"
import { Stack } from "@/components/layout/Stack"

export const ThreadMessages = ({ threadMessage }: { threadMessage: Message }) => {

    const { threadID, channelID } = useParams()

    const { channelMembers } = useFetchChannelMembers(channelID ?? '')

    const { stopTyping, onUserType } = useTyping(threadID ?? '')


    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const clearSelectedMessage = () => {
        setSelectedMessage(null)
    }

    const onMessageSendCompleted = () => {
        // Stop the typing indicator
        stopTyping()
        // Clear the selected message
        clearSelectedMessage()
    }

    const { fileInputRef, files, setFiles, removeFile, uploadFiles, addFile, fileUploadProgress } = useFileUpload(threadID ?? '')

    const { sendMessage, loading } = useSendMessage(threadID ?? '', files.length, uploadFiles, onMessageSendCompleted, selectedMessage)

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
                    onClick={clearSelectedMessage}>
                    <BiX size='20' />
                </IconButton>
            </ReplyMessageBox>
        }
        return null
    }

    const { name: user } = useUserData()
    const { channelMembers: threadMembers } = useFetchChannelMembers(threadID ?? '')

    const isUserInChannel = useMemo(() => {
        if (user && threadMembers) {
            return user in threadMembers
        }
        return false
    }, [user, threadMembers])



    return (
        <Flex direction='column' justify={'between'} gap='0' className="h-full p-4">
            <FileDrop
                files={files}
                areaHeight="h-[calc(100vh-72px)]"
                height="100%"
                width={'w-[calc((100vw-var(--sidebar-width)-var(--space-8)-var(--space-5))/2)]'}
                ref={fileInputRef}
                onFileChange={setFiles}
                maxFiles={10}
                maxFileSize={10000000}>
                <ThreadFirstMessage message={threadMessage} />
                <ChatStream
                    channelID={threadID ?? ''}
                    replyToMessage={handleReplyAction}
                    showThreadButton={false}
                />
                <AIEvent channelID={threadID ?? ''} />

                {!isUserInChannel && <JoinChannelBox
                    user={user} />}

                {isUserInChannel && <Stack>
                    <TypingIndicator channel={threadID ?? ''} />
                    <Tiptap
                        key={threadID}
                        channelID={threadID}
                        fileProps={{
                            fileInputRef,
                            addFile
                        }}
                        onUserType={onUserType}
                        channelMembers={channelMembers}
                        clearReplyMessage={clearSelectedMessage}
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
                </Stack>}
            </FileDrop>
        </Flex>
    )
}