import { Box, HStack, IconButton, Popover, PopoverContent, PopoverTrigger, Stack, StackDivider, useColorMode, useDisclosure, Wrap, WrapItem } from "@chakra-ui/react"
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
import { AlertBanner } from "../../layout/AlertBanner"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"

interface ChatInputProps {
    channelID: string,
    allMembers: { id: string; value: string; }[],
    allChannels: { id: string; value: string; }[]
}

export const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

export const ChatInput = ({ channelID, allMembers, allChannels }: ChatInputProps) => {

    Quill.register('modules/linkify', Linkify)

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
            onSubmit();
        }
    }

    useHotkeys('enter', () => onSubmit(), {
        enabled: true,
        preventDefault: true,
        enableOnFormTags: true,
    })

    const onSubmit = () => {

        const editor = reactQuillRef.current?.getEditor()
        const textWithoutHTML = editor?.getText()

        if (textWithoutHTML && textWithoutHTML?.trim()?.length > 0) {
            //Remove trailing newline and <br>
            call({
                channel_id: channelID,
                text: text.replace(/(<p><br><\/p>\s*)+$/, '')
            }).then(() => {
                setText("")
            })
        }
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
                values = allMembers;
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

    const { colorMode } = useColorMode()

    const modalManager = useModalManager()

    const onEmojiPickerOpen = () => {
        modalManager.openModal(ModalTypes.EmojiPicker)
    }

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setText(text + emojiObject.emoji)
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

    return (
        <Box>

            <FileDrop
                files={files}
                ref={fileInputRef}
                onFileChange={setFiles}
                maxFiles={10}
                maxFileSize={10000000} />

            {errorCreatingDoc?.httpStatus === 409 ? <AlertBanner status='error' heading='File already exists.'>{errorCreatingDoc.message} - {errorCreatingDoc.httpStatus}</AlertBanner> : null}
            {errorUploadingDoc ? <AlertBanner status='error' heading='Error uploading file'>{errorUploadingDoc.message} - {errorUploadingDoc.httpStatus}</AlertBanner> : null}
            {errorUpdatingDoc ? <AlertBanner status='error' heading='Error updating doctype with selected file information.'>{errorUpdatingDoc.message} - {errorUpdatingDoc.httpStatus}</AlertBanner> : null}

            <Box>
                <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"}>
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
                            mention
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
                                <IconButton size='xs' aria-label={"add file"} onClick={fileButtonClicked} icon={<IoMdAdd />} rounded='xl' />
                                <Box>
                                    <Popover
                                        isOpen={modalManager.modalType === ModalTypes.EmojiPicker}
                                        onClose={modalManager.closeModal}
                                        placement='top-end'
                                        isLazy
                                        lazyBehavior="unmount"
                                        gutter={48}>
                                        <PopoverTrigger>
                                            <IconButton size='xs' variant='ghost' aria-label={"pick emoji"} icon={<FaRegSmile fontSize='1.0rem' />} onClick={onEmojiPickerOpen} />
                                        </PopoverTrigger>
                                        <PopoverContent border={'none'} rounded='lg'>
                                            {/* @ts-ignore */}
                                            <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis theme={colorMode === 'light' ? 'light' : 'dark'} />
                                        </PopoverContent>
                                    </Popover>
                                </Box>
                            </HStack>
                            <IconButton
                                size='xs'
                                variant='ghost'
                                aria-label={"mention channel member"}
                                icon={<VscMention fontSize='1.5rem' />}
                                onClick={onMentionIconClick} />
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