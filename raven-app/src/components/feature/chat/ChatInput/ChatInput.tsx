import { Box, HStack, IconButton, Stack, StackDivider, useColorMode, Wrap, WrapItem } from "@chakra-ui/react"
import { useContext, useMemo, useRef, useState } from "react"
import { RiSendPlaneFill } from "react-icons/ri"

import { useFrappeCreateDoc, useFrappeFileUpload, useFrappePostCall, useFrappeUpdateDoc } from "frappe-react-sdk"
import { useHotkeys } from "react-hotkeys-hook"


import { CustomFile, FileDrop } from "../../file-upload/FileDrop"
import { FileListItem } from "../../file-upload/FileListItem"
import { getFileExtension } from "../../../../utils/operations"
import { ErrorBanner } from "../../../layout/AlertBanner"
import { Message } from "../../../../../../types/Messaging/Message"
import { PreviousMessageBox } from "../MessageReply/PreviousMessageBox"
import { EmojiPickerPopover, FileUploadButton, MentionButton } from "."
import { QuillEditor } from "./QuillEditor"
import ReactQuill from "react-quill"
import { ChannelListContext, ChannelListContextType } from "@/utils/channel/ChannelListProvider"
import { ChannelContext } from "@/utils/channel/ChannelProvider"

interface ChatInputProps {
    channelID: string,
    selectedMessage?: Message | null,
    handleCancelReply: () => void
}

type value = {
    id: string,
    value: string
}

export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

export const ChatInput = ({ channelID, selectedMessage, handleCancelReply }: ChatInputProps) => {

    const { call } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')
    const { createDoc, loading: creatingDoc, error: errorCreatingDoc, reset: resetCreateDoc } = useFrappeCreateDoc()
    const { upload, loading: uploadingFile, progress, error: errorUploadingDoc, reset: resetUploadDoc } = useFrappeFileUpload()
    const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc, reset: resetUpdateDoc } = useFrappeUpdateDoc()

    const [text, setText] = useState("")

    useHotkeys('enter', () => onSubmit(), {
        enabled: true,
        preventDefault: true,
        enableOnFormTags: true,
    })

    const onSubmit = () => {
        call({
            channel_id: channelID,
            text: text,
            is_reply: selectedMessage ? 1 : 0,
            linked_message: selectedMessage ? selectedMessage.name : null
        }).then(() => {
            setText("")
            handleCancelReply()
        })
        if (files.length > 0) {
            const promises = files.map(async (f: CustomFile) => {
                let docname = ''
                return createDoc('Raven Message', {
                    channel_id: channelID
                }).then((d) => {
                    docname = d.name
                    f.uploading = true
                    f.uploadProgress = progress
                    return upload(f, {
                        isPrivate: true,
                        doctype: 'Raven Message',
                        docname: d.name,
                        fieldname: 'file',
                    })
                }).then((r) => {
                    f.uploading = false
                    return updateDoc("Raven Message", docname, {
                        file: r.file_url,
                        message_type: fileExt.includes(getFileExtension(f.name)) ? "Image" : "File",
                    })
                })
            })

            Promise.all(promises)
                .then(() => {
                    setFiles([])
                    resetCreateDoc()
                    resetUploadDoc()
                    resetUpdateDoc()
                }).catch((e) => {
                    console.log(e)
                })
        }
    }

    const { colorMode } = useColorMode()

    const reactQuillRef = useRef<ReactQuill>(null)

    const fileInputRef = useRef<any>(null)

    const [files, setFiles] = useState<CustomFile[]>([])

    const removeFile = (id: string) => {
        let newFiles = files.filter(file => file.fileID !== id)
        setFiles(newFiles)
    }

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const { users } = useContext(ChannelContext)

    const allUsers: value[] = Object.values(users).map((user) => {
        return {
            id: user.name,
            value: user.full_name ?? user.name
        }
    })

    const allChannels: value[] = useMemo(() => channels?.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    }) ?? [], [channels])

    return (
        <Box>

            <FileDrop
                files={files}
                ref={fileInputRef}
                onFileChange={setFiles}
                maxFiles={10}
                maxFileSize={10000000} />

            <ErrorBanner error={errorCreatingDoc} />
            <ErrorBanner error={errorUploadingDoc} />
            <ErrorBanner error={errorUpdatingDoc} />

            <Box>
                <Stack spacing={0} border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"}>
                    {selectedMessage && (
                        <PreviousMessageBox previous_message_content={selectedMessage} onReplyingToMessageClose={handleCancelReply} />
                    )}
                    <QuillEditor text={text} setText={setText} onSubmit={onSubmit} setFiles={setFiles} allUsers={allUsers} allChannels={allChannels} reactQuillRef={reactQuillRef} />
                    {files.length > 0 &&
                        <Wrap spacingX={'2'} spacingY='2' w='full' spacing='0' alignItems='flex-end' px='2' pb='1'>
                            {files.map((f: CustomFile) => <WrapItem key={f.fileID}><FileListItem file={f} isUploading={f.uploading} uploadProgress={f.uploadProgress} removeFile={() => removeFile(f.fileID)} /></WrapItem>)}
                        </Wrap>
                    }
                    <HStack w='full' justify={'space-between'} px='2' pb='2'>
                        <HStack alignItems='flex-end'>
                            <HStack divider={<StackDivider />}>
                                <FileUploadButton fileInputRef={fileInputRef} />
                                <EmojiPickerPopover text={text} setText={setText} />
                            </HStack>
                            <MentionButton current={reactQuillRef.current} />
                        </HStack>
                        <IconButton
                            isDisabled={text.length === 0 && files.length === 0}
                            isLoading={creatingDoc || uploadingFile || updatingDoc}
                            colorScheme='blue'
                            onClick={onSubmit}
                            mx='4'
                            aria-label={"send message"}
                            icon={<RiSendPlaneFill />}
                            size='xs' />
                    </HStack>
                </Stack>
            </Box>
        </Box>
    )
}