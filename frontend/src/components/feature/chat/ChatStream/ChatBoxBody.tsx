import { Message } from "../../../../../../types/Messaging/Message"
import { useMemo, useState } from "react"
import { ArchivedChannelBox } from "../chat-footer/ArchivedChannelBox"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { JoinChannelBox } from "../chat-footer/JoinChannelBox"
import { useUserData } from "@/hooks/useUserData"
import useFileUpload from "../ChatInput/FileInput/useFileUpload"
import { CustomFile, FileDrop } from "../../file-upload/FileDrop"
import { FileListItem } from "../../file-upload/FileListItem"
import { useSendMessage } from "../ChatInput/useSendMessage"
import { Flex, Box, IconButton } from "@radix-ui/themes"
import { ReplyMessageBox } from "../ChatMessage/ReplyMessageBox/ReplyMessageBox"
import { BiX } from "react-icons/bi"
import ChatStream from "./ChatStream"
import Tiptap from "../ChatInput/Tiptap"
import useFetchChannelMembers from "@/hooks/fetchers/useFetchChannelMembers"
import { useParams } from "react-router-dom"
import clsx from "clsx"

const COOL_PLACEHOLDERS = [
    "Delivering messages atop dragons 🐉 is available on a chargeable basis.",
    "Note 🚨: Service beyond the wall is currently disrupted due to bad weather.",
    "Pigeons just have better brand recognition tbh 🤷🏻",
    "Ravens double up as spies. Eyes everywhere 👀",
    "Ravens do not 'slack' off. See what we did there? 😉",
    "Were you expecting a funny placeholder? 😂",
    "Want to know who writes these placeholders? 🤔. No one.",
    "Type a message..."
]
// const randomPlaceholder = COOL_PLACEHOLDERS[Math.floor(Math.random() * (COOL_PLACEHOLDERS.length))]
interface ChatBoxBodyProps {
    channelData: ChannelListItem | DMChannelListItem
}

export const ChatBoxBody = ({ channelData }: ChatBoxBodyProps) => {

    const { name: user } = useUserData()
    const { channelMembers, isLoading } = useFetchChannelMembers(channelData.name)

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
                    size='1'
                    variant="soft"
                    onClick={handleCancelReply}>
                    <BiX size='20' />
                </IconButton>
            </ReplyMessageBox>
        }
        return null
    }


    const isDM = channelData?.is_direct_message === 1 || channelData?.is_self_message === 1

    const { threadID } = useParams()

    return (
        <Flex height='100%' direction='column' justify={'end'} pt='9' className={clsx("w-full overflow-hidden px-2", threadID ? "sm:pl-4" : "sm:px-4")}>

            <FileDrop
                files={files}
                ref={fileInputRef}
                onFileChange={setFiles}
                width={threadID ? 'w-[calc((100vw-var(--sidebar-width)-var(--space-8))/2)]' : undefined}
                maxFiles={10}
                maxFileSize={10000000}>
                <ChatStream
                    channelID={channelData.name}
                    replyToMessage={handleReplyAction}
                />
                {channelData?.is_archived == 0 && (isUserInChannel || channelData?.type === 'Open')
                    &&
                    <Tiptap
                        key={channelData.name}
                        fileProps={{
                            fileInputRef,
                            addFile
                        }}
                        clearReplyMessage={handleCancelReply}
                        channelMembers={channelMembers}
                        // placeholder={randomPlaceholder}
                        replyMessage={selectedMessage}
                        sessionStorageKey={`tiptap-${channelData.name}`}
                        onMessageSend={sendMessage}
                        messageSending={loading}
                        slotBefore={<Flex direction='column' justify='center' hidden={!selectedMessage && !files.length}>
                            {selectedMessage && <PreviousMessagePreview selectedMessage={selectedMessage} />}
                            {files && files.length > 0 && <Flex gap='2' width='100%' align='end' px='2' p='2' wrap='wrap'>
                                {files.map((f: CustomFile) => <Box className="grow-0" key={f.fileID}><FileListItem file={f} uploadProgress={fileUploadProgress} removeFile={() => removeFile(f.fileID)} /></Box>)}
                            </Flex>}
                        </Flex>}
                    />
                }
                {channelData && !isLoading && <>
                    {channelData.is_archived == 0 && !isUserInChannel && channelData.type !== 'Open' && !isDM &&
                        <JoinChannelBox
                            channelData={channelData}
                            channelMembers={channelMembers}
                            user={user} />}
                    {channelData.is_archived == 1 && <ArchivedChannelBox channelData={channelData} channelMembers={channelMembers} />}
                </>}
            </FileDrop>
        </Flex>
    )

}