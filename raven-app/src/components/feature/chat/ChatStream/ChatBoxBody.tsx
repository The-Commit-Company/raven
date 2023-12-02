import { ChatHistory } from "./ChatHistory"
import { useFrappeDocumentEventListener, useFrappeEventListener, useFrappeGetCall } from "frappe-react-sdk"
import { Message, MessagesWithDate } from "../../../../../../types/Messaging/Message"
import { FullPageLoader } from "@/components/layout/Loaders"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { Suspense, lazy, useContext, useMemo, useState } from "react"
import { ArchivedChannelBox } from "../chat-footer/ArchivedChannelBox"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { JoinChannelBox } from "../chat-footer/JoinChannelBox"
import { useUserData } from "@/hooks/useUserData"
import { ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { UserContext } from "@/utils/auth/UserProvider"
import useFileUpload from "../ChatInput/FileInput/useFileUpload"
import { CustomFile, FileDrop } from "../../file-upload/FileDrop"
import { FileListItem } from "../../file-upload/FileListItem"
import { useSendMessage } from "../ChatInput/useSendMessage"
import { Loader } from "@/components/common/Loader"
import { Flex, Box, IconButton } from "@radix-ui/themes"
import { ReplyMessageBox } from "../ChatMessage/ReplyMessageBox/ReplyMessageBox"
import { BiX } from "react-icons/bi"


const Tiptap = lazy(() => import("../ChatInput/Tiptap"))
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

    useFrappeDocumentEventListener('Raven Channel', channelData.name, () => { })

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

    const { fileInputRef, files, setFiles, removeFile, uploadFiles, addFile, fileUploadProgress } = useFileUpload(channelData.name)

    const { sendMessage, loading } = useSendMessage(channelData.name, files.length, uploadFiles, handleCancelReply, selectedMessage)

    const PreviousMessagePreview = ({ selectedMessage }: { selectedMessage: any }) => {

        if (selectedMessage) {
            return <ReplyMessageBox
                justify='between'
                align='center'
                className="m-2"
                message={selectedMessage}>
                <IconButton
                    color='gray'
                    variant="soft"
                    onClick={handleCancelReply}>
                    <BiX size='24' />
                </IconButton>
            </ReplyMessageBox>
        }
        return null
    }

    if (isLoading) {
        //TODO: Replace with skeleton loader
        return <FullPageLoader />
    }

    if (error) {
        return <Box p='2' pt='9' className="h-screen"><ErrorBanner error={error} /></Box>
    }

    if (data) {
        return (
            <Flex height='100%' direction='column' justify={'end'} p='4' pt='9' className="overflow-hidden">
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
                        <Suspense fallback={<Flex align='center' justify='center' width='100%' height='9'><Loader /></Flex>}>
                            <Tiptap
                                fileProps={{
                                    fileInputRef,
                                    addFile
                                }}
                                onMessageSend={sendMessage}
                                messageSending={loading}
                                slotBefore={<Flex direction='column' justify='center' hidden={!selectedMessage && !files.length}>
                                    {selectedMessage && <PreviousMessagePreview selectedMessage={selectedMessage} />}
                                    {files && files.length > 0 && <Flex gap='2' width='100%' align='end' px='2' p='2' wrap='wrap'>
                                        {files.map((f: CustomFile) => <Box className="grow-0" key={f.fileID}><FileListItem file={f} uploadProgress={fileUploadProgress} removeFile={() => removeFile(f.fileID)} /></Box>)}
                                    </Flex>}
                                </Flex>}
                            />
                        </Suspense>
                    }
                    {channelData?.is_archived == 0 && (!isUserInChannel && channelData?.type !== 'Open' &&
                        <JoinChannelBox
                            channelData={channelData}
                            channelMembers={channelMembers}
                            user={user} />)}
                    {channelData && channelData.is_archived == 1 && <ArchivedChannelBox channelData={channelData} channelMembers={channelMembers} />}
                </FileDrop>
            </Flex>
        )
    }

    return null
}