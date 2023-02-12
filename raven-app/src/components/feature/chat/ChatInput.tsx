import { Box, IconButton, useColorMode } from "@chakra-ui/react"
import { useState } from "react"
import { RiSendPlaneFill } from "react-icons/ri"
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import './styles.css'
import { useFrappePostCall } from "frappe-react-sdk"
import { useHotkeys } from "react-hotkeys-hook"

interface ChatInputProps {
    channelID: string
}

export const ChatInput = ({ channelID }: ChatInputProps) => {

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
        call({
            channel_id: channelID,
            text: text
        }).then(() => {
            setText("")
        })
    }

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
        ]
    }

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link'
    ]

    const { colorMode } = useColorMode()

    return (
        <Box border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' maxH='40vh' boxShadow='base' position='fixed' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"}>
            <ReactQuill
                className="my-quill-editor"
                onChange={handleChange}
                value={text}
                placeholder={"Type a message..."}
                modules={modules}
                formats={formats}
                onKeyDown={handleKeyDown} />
            <IconButton
                isDisabled={text.length === 0}
                style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                colorScheme='blue'
                onClick={onSubmit}
                aria-label={"send message"}
                icon={<RiSendPlaneFill />}
                size='xs' />
        </Box>
    )
}
