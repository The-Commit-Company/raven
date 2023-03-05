import { Box, HStack, IconButton, List, Popover, PopoverContent, PopoverTrigger, Stack, StackDivider, useColorMode, useDisclosure } from "@chakra-ui/react"
import { useCallback, useRef, useState } from "react"
import { RiSendPlaneFill } from "react-icons/ri"
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import './styles.css'
import { useFrappePostCall } from "frappe-react-sdk"
import { useHotkeys } from "react-hotkeys-hook"
import "quill-mention";
import 'quill-mention/dist/quill.mention.css';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FaRegSmile } from 'react-icons/fa'
import { IoMdAdd } from 'react-icons/io'
import { VscMention } from 'react-icons/vsc'
import { CustomFile, FileDrop } from "../file-upload/FileDrop"
import { FileListItem } from "../file-upload/FileListItem"

interface ChatInputProps {
    channelID: string,
    allMembers: { id: string; value: string; }[],
    allChannels: { id: string; value: string; }[]
}

export const ChatInput = ({ channelID, allMembers, allChannels }: ChatInputProps) => {

    const { call } = useFrappePostCall('raven.raven_messaging.doctype.raven_message.raven_message.send_message')

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
        if (text.length > 0 || files.length > 0) {
            call({
                channel_id: channelID,
                text: text
            }).then(() => {
                setText("")
            })
        }
    }

    const onMentionIconClick = () => {
        setText(text + "@")
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

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'mention',
        'code-block'
    ]

    const { colorMode } = useColorMode()

    const { isOpen: showEmojiPicker, onToggle: onEmojiPickerToggle, onClose: onEmojiPickerClose } = useDisclosure()

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setText(text + emojiObject.emoji)
        onEmojiPickerClose()
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

            <Box>
                <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' maxH='40vh' boxShadow='base' position='fixed' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ReactQuill
                        className={colorMode === 'light' ? 'my-quill-editor light-theme' : 'my-quill-editor dark-theme'}
                        onChange={handleChange}
                        value={text}
                        placeholder={"Type a message..."}
                        modules={{
                            toolbar: [
                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link', 'code-block']
                            ],
                            mention
                        }}
                        formats={formats}
                        onKeyDown={handleKeyDown} />
                    {files.length > 0 &&
                        <List size="sm" as={HStack} spacing='0' alignItems='flex-end' px='2' pb='1'>
                            {files.map((f: CustomFile) => <FileListItem key={f.fileID} file={f} isUploading={f.uploading} uploadProgress={f.uploadProgress} removeFile={() => removeFile(f.fileID)} />)}
                        </List>
                    }
                    <HStack w='full' justify={'space-between'} px='2' pb='2'>
                        <HStack alignItems='flex-end'>
                            <HStack divider={<StackDivider />}>
                                <IconButton size='xs' aria-label={"add file"} onClick={fileButtonClicked} icon={<IoMdAdd />} rounded='xl' />
                                <Box>
                                    <Popover
                                        isOpen={showEmojiPicker}
                                        onClose={onEmojiPickerClose}
                                        placement='top-end'
                                        isLazy
                                        lazyBehavior="unmount"
                                        gutter={48}
                                        closeOnBlur={false}>
                                        <PopoverTrigger>
                                            <IconButton size='xs' variant='ghost' aria-label={"pick emoji"} icon={<FaRegSmile fontSize='1.0rem' />} onClick={onEmojiPickerToggle} />
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