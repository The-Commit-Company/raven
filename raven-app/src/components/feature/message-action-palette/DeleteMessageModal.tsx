import { Text, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, useToast, Stack } from "@chakra-ui/react"
import { useFrappeDeleteDoc, useSWRConfig } from "frappe-react-sdk"
import { useRef } from "react"
import { AlertBanner, ErrorBanner } from "../../layout/AlertBanner"
import { useParams } from "react-router-dom"
import useSound from "use-sound"
import deleteSound from '../../../utils/sounds/delete.mp3'

interface DeleteMessageModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    channelMessageID: string
}

export const DeleteMessageModal = ({ isOpen, onClose, channelMessageID }: DeleteMessageModalProps) => {

    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error, loading } = useFrappeDeleteDoc()
    const toast = useToast()

    const { mutate } = useSWRConfig()

    // const updateMessages = useCallback(() => {
    //     mutate(`get_messages_for_channel_${channelMessageID}`)
    // }, [mutate, channelMessageID])

    const { channelID } = useParams()

    const [play] = useSound(
        deleteSound,
        { volume: 0.5 }
    );

    const onSubmit = () => {
        return deleteDoc('Raven Message', channelMessageID
        ).then(() => {
            play()
            toast({
                title: 'Message deleted successfully',
                status: 'success',
                duration: 1500,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
            mutate(`get_messages_for_channel_${channelID}`)
            onClose()
        }).catch((e) => {
            toast({
                title: 'Error: could not delete message.',
                status: 'error',
                duration: 3000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true,
                description: `${e.message}`
            })
        })
    }

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} >
            <AlertDialogOverlay />
            <AlertDialogContent>
                <AlertDialogHeader>
                    Delete Message
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <Stack>
                        <ErrorBanner error={error} />
                        <AlertBanner status='warning' heading='This action is permanent.' />
                        <Text fontSize='sm'>Are you sure you want to delete this message? It will be deleted for all users.</Text>
                    </Stack>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <ButtonGroup>
                        <Button ref={cancelRef} variant='ghost' onClick={() => onClose(false)}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit} isDisabled={loading} isLoading={loading}>Delete</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}