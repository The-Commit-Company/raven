import { Box, IconButton, Stack } from "@chakra-ui/react"
import { useState } from "react"
import { RiSendPlaneFill } from "react-icons/ri"
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import './styles.css'

interface ChatInputProps {
    addMessage: (text: string, user: string) => Promise<void>
}

export const ChatInput = ({ addMessage }: ChatInputProps) => {

    const [text, setText] = useState("")

    const handleChange = (value: string) => {
        setText(value)
    }

    const onSubmit = async () => {
        await addMessage(text, "User 1")
        setText("")
    }

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
        ],
    }

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link'
    ]

    return (
        <Box border='1px' borderColor={'gray.500'} rounded='lg' boxShadow='base' position='relative'>
            <ReactQuill
                className="my-quill-editor"
                onChange={handleChange}
                value={text}
                placeholder={"Type a message..."}
                modules={modules}
                formats={formats} />
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
