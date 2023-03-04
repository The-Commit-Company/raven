import { Text, AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, ButtonGroup, useToast, HStack } from "@chakra-ui/react"
import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { useRef } from "react"
import { BsExclamationTriangle } from "react-icons/bs"
import { AlertBanner } from "../../layout/AlertBanner"

interface DeleteMessageModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    channelMessageID: string
}

export const DeleteMessageModal = ({ isOpen, onClose, channelMessageID }: DeleteMessageModalProps) => {

    const cancelRef = useRef<HTMLButtonElement | null>(null)
    const { deleteDoc, error } = useFrappeDeleteDoc()
    const toast = useToast()

    const onSubmit = () => {
        return deleteDoc('Raven Message', channelMessageID
        ).then(() => {
            toast({
                title: 'Message deleted successfully',
                status: 'success',
                duration: 1500,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
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
                    {error && <AlertBanner status='error' heading={error.message}>{error.exception} - HTTP {error.httpStatus}</AlertBanner>}
                    <HStack><BsExclamationTriangle fontSize='0.8rem' /><Text fontSize='sm'><strong>This action is permanent.</strong></Text></HStack>
                    <Text fontSize='sm'>Are you sure you want to delete this message? It will be deleted for all users.</Text>
                </AlertDialogBody>
                <AlertDialogFooter>
                    <ButtonGroup>
                        <Button ref={cancelRef} variant='ghost' onClick={() => onClose(false)}>Cancel</Button>
                        <Button colorScheme='red' onClick={onSubmit}>Delete</Button>
                    </ButtonGroup>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}