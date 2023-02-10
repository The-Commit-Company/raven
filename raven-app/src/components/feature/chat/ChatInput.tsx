import { chakra, Flex, IconButton, Input } from "@chakra-ui/react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { RiSendPlaneFill } from "react-icons/ri"

interface ChatInputProps {
    addMessage: (text: string, user: string) => Promise<void>
}

export const ChatInput = ({ addMessage }: ChatInputProps) => {

    const [text, setText] = useState("")
    const methods = useForm()

    const { handleSubmit } = methods

    // console.log("text", text)

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
    }

    const onSubmit = () => {
        addMessage(text, "User 1").then(() => {
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