import { HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, Text, useToast } from "@chakra-ui/react"
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"
import { useEffect } from "react"
import { ErrorBanner } from "../../layout/AlertBanner"
import { Tiptap } from "../chat/ChatInput/Tiptap"

interface EditMessageModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    channelMessageID: string,
    originalText: string
}

export const EditMessageModal = ({ isOpen, onClose, channelMessageID, originalText }: EditMessageModalProps) => {

    const { mutate } = useSWRConfig()
    const toast = useToast()
    const { updateDoc, error, loading, reset } = useFrappeUpdateDoc()

    useEffect(() => {
        reset()
    }, [isOpen, reset])

    const onSubmit = async (html: string, json: any) => {
        console.log("Submit")
        return updateDoc('Raven Message', channelMessageID,
            { text: html, json }).then((d) => {
                onClose(true)
                toast({
                    title: "Message updated",
                    description: "Your message has been updated",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                })
                mutate(`get_messages_for_channel_${d.channel_id}`)

            }).catch((e) => {
                toast({
                    title: "Error",
                    description: e.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true
                })
            })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Message</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack pb='3'>
                        <ErrorBanner error={error} />
                        <Tiptap onMessageSend={onSubmit} messageSending={loading} defaultText={originalText} />
                        <HStack justify={'flex-end'}>
                            <Text fontSize='sm' color='gray.500'>Press <b>Enter</b> to save</Text>
                        </HStack>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}