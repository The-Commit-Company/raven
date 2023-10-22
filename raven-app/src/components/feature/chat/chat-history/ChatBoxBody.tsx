import { Box, Stack, Wrap, WrapItem } from "@chakra-ui/react"
import { ChatHistory } from "./ChatHistory"
import { useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk"
import { Message, MessagesWithDate } from "../../../../../../types/Messaging/Message"
import { FullPageLoader } from "@/components/layout/Loaders"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { useContext, useMemo, useState } from "react"
import { ArchivedChannelBox } from "../chat-footer/ArchivedChannelBox"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { JoinChannelBox } from "../chat-footer/JoinChannelBox"
import { ChatInput } from "../chat-input"
import { useUserData } from "@/hooks/useUserData"
import { ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { UserContext } from "@/utils/auth/UserProvider"
import { Tiptap } from "../ChatInput/Tiptap"
import useFileUpload from "../ChatInput/FileInput/useFileUpload"
import { CustomFile, FileDrop } from "../../file-upload/FileDrop"
import { FileListItem } from "../../file-upload/FileListItem"
import { PreviousMessageBox } from "../message-reply/PreviousMessageBox"
import { useSendMessage } from "../chat-input/useSendMessage"

interface ChatBoxBodyProps {
    channelData: ChannelListItem | DMChannelListItem
}

export const ChatBoxBody = ({ channelData }: ChatBoxBodyProps) => {

    const { currentUser } = useContext(UserContext)
    const { data, error, mutate, isLoading } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channelData.name
    }, `get_messages_for_channel_${channelData.name}`, {
        revalidateOnFocus: false
    })

    useFrappeEventListener('message_updated', (data) => {
        //If the message is sent on the current channel
        if (data.channel_id === channelData.name) {
            //If the sender is not the current user
            if (data.sender !== currentUser) {
                mutate()
            }
        }
    })

    const { name: user } = useUserData()
    const { channelMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }

    const isUserInChannel = useMemo(() => {
        if (user && channelMembers) {
            return user in channelMembers
        }
        return false
    }, [user, channelMembers])

    const { fileInputRef, files, setFiles, removeFile, uploadFiles, addFile } = useFileUpload(channelData.name)

    const { sendMessage, loading } = useSendMessage(channelData.name, files.length, uploadFiles, handleCancelReply, selectedMessage)

    const PreviousMessagePreview = () => {

        if (selectedMessage) {
            return <PreviousMessageBox
                previous_message_content={selectedMessage}
                onReplyingToMessageClose={handleCancelReply}
                channelData={channelData} />
        }
        return null
    }
    const FilePreviewList = () => {
        if (files.length === 0) {
            return null
        }
        return <Wrap spacingX={'2'} spacingY='2' w='full' spacing='0' alignItems='flex-end' px='2' p='2'>
            {files.map((f: CustomFile) => <WrapItem key={f.fileID}><FileListItem file={f} isUploading={f.uploading} uploadProgress={f.uploadProgress} removeFile={() => removeFile(f.fileID)} /></WrapItem>)}
        </Wrap>
    }

    const EditorSlot = () => {
        if (selectedMessage || files.length > 0) {
            return <Stack>
                {PreviousMessagePreview()}
                {FilePreviewList()}
            </Stack>
        } else {
            return null
        }
    }

    if (isLoading) {
        return <FullPageLoader />
    }

    if (error) {
        return <Box p={2}><ErrorBanner error={error} /></Box>
    }

    if (data) {
        return (
            <Stack h='full' justify={'flex-end'} p={4} overflow='hidden' pt='16'>
                <FileDrop
                    files={files}
                    ref={fileInputRef}
                    onFileChange={setFiles}
                    maxFiles={10}
                    maxFileSize={10000000}>
                    <ChatHistory
                        parsedMessages={data.message}
                        replyToMessage={handleReplyAction}
                        channelData={channelData} />

                    {channelData?.is_archived == 0 && (isUserInChannel || channelData?.type === 'Open')
                        &&
                        <Tiptap
                            fileProps={{
                                fileInputRef,
                                addFile
                            }}
                            onMessageSend={sendMessage}
                            messageSending={loading}
                            slotBefore={<EditorSlot />}
                        />
                    }
                    {channelData?.is_archived == 0 && (!isUserInChannel && channelData?.type !== 'Open' &&
                        <JoinChannelBox
                            channelData={channelData}
                            channelMembers={channelMembers}
                            user={user} />)}
                </FileDrop>
                {/* {channelData?.is_archived == 0 && ((isUserInChannel || channelData?.type === 'Open') &&
                    <ChatInput
                        channelID={channelData?.name}
                        selectedMessage={selectedMessage}
                        handleCancelReply={handleCancelReply}
                        channelData={channelData}
                        channelMembers={channelMembers} />)} */}

                {channelData && channelData.is_archived == 1 && <ArchivedChannelBox channelData={channelData} channelMembers={channelMembers} />}
            </Stack>
        )
    }

    return null
}