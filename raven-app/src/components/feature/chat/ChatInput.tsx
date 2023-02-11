import { Box, IconButton, Stack } from "@chakra-ui/react"
import { useState, useContext } from "react"
import { RiSendPlaneFill } from "react-icons/ri"
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import './styles.css'
import { useFrappePostCall } from "frappe-react-sdk"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelContext } from "../../../utils/channel/ChannelContext"
import { useHotkeys } from "react-hotkeys-hook"

interface ChatInputProps {
    addMessage: (text: string, user: string) => Promise<void>
}

export const ChatInput = ({ addMessage }: ChatInputProps) => {

    const { currentUser } = useContext(UserContext)
    const { channelID } = useContext(ChannelContext)

    const { call } = useFrappePostCall('raven.messaging.doctype.message.message.send_message')

    const [text, setText] = useState("")

    const handleChange = (value: string) => {
        setText(value)
    }

    useHotkeys('enter', () => onSubmit(), {
        enabled: true,
        preventDefault: true,
        enableOnFormTags: true,
    })

    const onSubmit = () => {
        call({
            user_id: currentUser,
            channel_id: channelID,
            text: text
        }).then(() =>
            addMessage(text, currentUser)
        ).then(() => {
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
