import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useEffect } from "react"
import { ErrorBanner } from "../../../../layout/AlertBanner/ErrorBanner"
import { IconButton, Dialog, Flex, Text, VisuallyHidden } from "@radix-ui/themes"
import { BiX } from "react-icons/bi"
import { TextMessage } from "../../../../../../../types/Messaging/Message"
import { toast } from "sonner"
import Tiptap from "../../ChatInput/Tiptap"

interface EditMessageModalProps {
    onClose: (refresh?: boolean) => void,
    message: TextMessage,
}

export const EditMessageModal = ({ onClose, message }: EditMessageModalProps) => {

    const { updateDoc, error, loading: updatingDoc, reset } = useFrappeUpdateDoc()

    useEffect(() => {
        reset()
    }, [reset])

    const onSubmit = async (html: string, json: any) => {
        return updateDoc('Raven Message', message.name,
            { text: html, json }).then((d) => {
                onClose(true)
                toast.info("Message updated")
            })
    }

    return (
        <>
            <Flex justify={'between'}>
                <Dialog.Title>Edit Message</Dialog.Title>
                <VisuallyHidden>
                    <Dialog.Description>Type in the new message text</Dialog.Description>
                </VisuallyHidden>
                <Dialog.Close disabled={updatingDoc} className="invisible sm:visible">
                    <IconButton size='1' variant="soft" color="gray">
                        <BiX size='18' />
                    </IconButton>
                </Dialog.Close>
            </Flex>

            <Flex gap='2' direction='column'>
                <ErrorBanner error={error} />
                <Tiptap onMessageSend={onSubmit} isEdit disableSessionStorage messageSending={updatingDoc} defaultText={message.text} />
                <Flex justify='end' className="hidden sm:block">
                    <Text size='1' color='gray'>Press <b>Enter</b> to save</Text>
                </Flex>
            </Flex>
        </>
    )
}