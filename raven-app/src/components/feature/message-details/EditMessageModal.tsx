import { Button, ButtonGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"

interface EditMessageModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    channelMessageID: string
}

export const EditMessageModal = ({ isOpen, onClose, channelMessageID }: EditMessageModalProps) => {

    const { channelData } = useContext(ChannelContext)

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Message</ModalHeader>
                <ModalCloseButton />

                <ModalBody>

                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='ghost' onClick={() => onClose(false)}>Cancel</Button>
                        <Button colorScheme='blue' type='submit'>Save</Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}