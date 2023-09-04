import { Box, HStack, IconButton, Popover, PopoverContent, PopoverTrigger, Stack, StackDivider, Tooltip, useColorMode, Wrap, WrapItem } from "@chakra-ui/react"
import { useCallback, useRef, useState } from "react"
import { RiSendPlaneFill } from "react-icons/ri"
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import './styles.css'
import { useFrappeCreateDoc, useFrappeFileUpload, useFrappePostCall, useFrappeUpdateDoc } from "frappe-react-sdk"
import { useHotkeys } from "react-hotkeys-hook"
import "quill-mention";
import 'quill-mention/dist/quill.mention.css';
import Quill from 'quill';
import { Linkify, Options } from 'quill-linkify';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FaRegSmile } from 'react-icons/fa'
import { IoMdAdd } from 'react-icons/io'
import { VscMention } from 'react-icons/vsc'
import { CustomFile, FileDrop } from "../file-upload/FileDrop"
import { FileListItem } from "../file-upload/FileListItem"
import { getFileExtension } from "../../../utils/operations"
import { AlertBanner, ErrorBanner } from "../../layout/AlertBanner"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { Message } from "../../../../../types/Messaging/Message"
import { PreviousMessageBox } from "./MessageReply/PreviousMessageBox"
import QuillImageDropAndPaste, { ImageData } from 'quill-image-drop-and-paste'

interface ChatInputProps {
    channelID: string,
    allUsers: { id: string; value: string; }[],
    allChannels: { id: string; value: string; }[],
    selectedMessage?: Message | null,
    handleCancelReply: () => void
}

Quill.register('modules/linkify', Linkify)
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste)

export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

export const ChatInput = ({ channelID, allUsers, allChannels, selectedMessage, handleCancelReply }: ChatInputProps) => {

    const { call } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')
    const { createDoc, loading: creatingDoc, error: errorCreatingDoc, reset: resetCreateDoc } = useFrappeCreateDoc()
    const { upload, loading: uploadingFile, progress, error: errorUploadingDoc, reset: resetUploadDoc } = useFrappeFileUpload()
    const { updateDoc, loading: updatingDoc, error: errorUpdatingDoc, reset: resetUpdateDoc } = useFrappeUpdateDoc()

    const reactQuillRef = useRef<ReactQuill>(null)
    const [text, setText] = useState("")

    const handleChange = (value: string) => {
        setText(value)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
        }
    }

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

    const onMentionIconClick = () => {
        if (reactQuillRef.current) {
            const editor = reactQuillRef.current?.getEditor()
            editor.getModule('mention').openMenu("@")
        }
    }

    const mention = {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@", "#"],
        source: useCallback((searchTerm: string, renderList: any, mentionChar: string) => {

            let values;

            if (mentionChar === "@") {
                values = allUsers;
            } else {
                values = allChannels;
            }

            if (searchTerm.length === 0) {
                renderList(values, searchTerm);
            } else {
                const matches = [];
                if (values)
                    for (let i = 0; i < values.length; i++)
                        if (
                            ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                        )
                            matches.push(values[i]);
                renderList(matches, searchTerm);
            }
        }, [])
    }

    const linkifyOptions: Options = {
        url: true,
        mail: true,
        phoneNumber: false
    }

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'mention',
        'code-block'
    ]

    if (reactQuillRef.current) {
        const editor = reactQuillRef.current?.getEditor()
        var keyboard = editor.getModule('keyboard');
        keyboard.bindings['Enter'] = null;
        keyboard.bindings['13'] = null;
    }

    const { colorMode } = useColorMode()

    const modalManager = useModalManager()

    const onEmojiPickerOpen = () => {
        modalManager.openModal(ModalTypes.EmojiPicker)
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        // remove html tags from text
        const textWithoutHTML = text.replace(/<(?!\/?span)[^>]+>/gi, "")
        // add emoji to text
        const newText = `${textWithoutHTML} ${emojiObject.emoji}`
        // set text
        setText(newText)
        modalManager.closeModal()
    }

    const fileInputRef = useRef<any>(null)

    const fileButtonClicked = () => {
        if (fileInputRef.current) {
            fileInputRef.current.openFileInput()
        }
    }
    const [files, setFiles] = useState<CustomFile[]>([])

    const removeFile = (id: string) => {
        let newFiles = files.filter(file => file.fileID !== id)
        setFiles(newFiles)
    }

    const imageDropAndPaste = {
        handler: useCallback((imageDataUrl: string, type: string, imageData: ImageData) => {
            console.log('Called')
            const file: CustomFile = imageData.toFile() as CustomFile
            if (file) {
                file.fileID = file.name + Date.now()
                file.uploadProgress = 0
                setFiles((f) => [...f, file])
            }

        }, [])
    }

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
                    <ReactQuill
                        className={colorMode === 'light' ? 'my-quill-editor light-theme' : 'my-quill-editor dark-theme'}
                        onChange={handleChange}
                        value={text}
                        ref={reactQuillRef}
                        placeholder={"Type a message..."}
                        modules={{
                            toolbar: [
                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link', 'code-block']
                            ],
                            linkify: linkifyOptions,
                            mention,
                            imageDropAndPaste,
                            clipboard: {
                                matchVisual: false
                            }
                        }}
                        formats={formats}
                        onKeyDown={handleKeyDown} />
                    {files.length > 0 &&
                        <Wrap spacingX={'2'} spacingY='2' w='full' spacing='0' alignItems='flex-end' px='2' pb='1'>
                            {files.map((f: CustomFile) => <WrapItem key={f.fileID}><FileListItem file={f} isUploading={f.uploading} uploadProgress={f.uploadProgress} removeFile={() => removeFile(f.fileID)} /></WrapItem>)}
                        </Wrap>
                    }
                    <HStack w='full' justify={'space-between'} px='2' pb='2'>
                        <HStack alignItems='flex-end'>
                            <HStack divider={<StackDivider />}>
                                <Tooltip hasArrow label='add files' placement='top' rounded={'md'}>
                                    <IconButton size='xs' aria-label={"add file"} onClick={fileButtonClicked} icon={<IoMdAdd />} rounded='xl' />
                                </Tooltip>
                                <Box>
                                    <Popover
                                        isOpen={modalManager.modalType === ModalTypes.EmojiPicker}
                                        onClose={modalManager.closeModal}
                                        placement='top-end'
                                        isLazy
                                        lazyBehavior="unmount"
                                        gutter={48}>
                                        <PopoverTrigger>
                                            <Tooltip hasArrow label='add emoji' placement='top' rounded={'md'}>
                                                <IconButton size='xs' variant='ghost' aria-label={"pick emoji"} icon={<FaRegSmile fontSize='1.0rem' />} onClick={onEmojiPickerOpen} />
                                            </Tooltip>
                                        </PopoverTrigger>
                                        <PopoverContent border={'none'} rounded='lg'>
                                            {/* @ts-ignore */}
                                            <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
                                        </PopoverContent>
                                    </Popover>
                                </Box>
                            </HStack>
                            <Tooltip hasArrow label='mention someone' placement='top' rounded={'md'}>
                                <IconButton
                                    size='xs'
                                    variant='ghost'
                                    aria-label={"mention channel member"}
                                    icon={<VscMention fontSize='1.5rem' />}
                                    onClick={onMentionIconClick} />
                            </Tooltip>
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