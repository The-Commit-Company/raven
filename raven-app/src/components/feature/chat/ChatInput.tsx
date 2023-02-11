import { chakra, Flex, IconButton, Input } from "@chakra-ui/react"
import { useFrappePostCall } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { RiSendPlaneFill } from "react-icons/ri"
import { UserContext } from "../../../utils/auth/UserProvider"

interface ChatInputProps {
    addMessage: (text: string, user: string) => Promise<void>
}

export const ChatInput = ({ addMessage }: ChatInputProps) => {
    const { currentUser } = useContext(UserContext)
    const channel_id = "862bf4d1ce"

    const { call, loading, error, reset } = useFrappePostCall('raven.messaging.doctype.message.message.send_message')

    const [text, setText] = useState("")
    const methods = useForm()

    const { handleSubmit } = methods

    // console.log("text", text)

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
    }

    const onSubmit = () => {
        call({
            user_id: currentUser,
            channel_id: channel_id,
            text: text
        }).then(() =>
            addMessage(text, currentUser)
        ).then(() => {
            setText("")
        })
    }

    return (
        <FormProvider {...methods}>
            <chakra.form onSubmit={handleSubmit(onSubmit)}>
                <Flex mt={4}>
                    <Input
                        value={text}
                        onChange={onChange}
                        placeholder="Type your message here..."
                        size="md"
                        px={4}
                        py={2}
                        mr={2}
                        w="100%"
                        maxW="sm"
                    />
                    <IconButton type="submit" size="md" isDisabled={text.length === 0} aria-label={"send message"} icon={<RiSendPlaneFill />} />
                </Flex>
            </chakra.form>
        </FormProvider>
    )
}