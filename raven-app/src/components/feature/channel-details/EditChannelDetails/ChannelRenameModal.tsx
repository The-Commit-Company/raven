import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, useToast } from "@chakra-ui/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useContext, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { useParams } from "react-router-dom"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"
import { AlertBanner } from "../../../layout/AlertBanner"

interface RenameChannelModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void
}

interface RenameChannelForm {
    channel_name: string
}

export const ChannelRenameModal = ({ isOpen, onClose }: RenameChannelModalProps) => {

    const { channelData } = useContext(ChannelContext)
    const { channelID } = useParams()

    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_name: channelData[0]?.channel_name
        }
    })
    const { register, handleSubmit, reset, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error, reset: resetUpdate } = useFrappeUpdateDoc()
    const toast = useToast()

    useEffect(() => {
        reset()
        resetUpdate()
    }, [isOpen, reset])

    const onSubmit = (data: RenameChannelForm) => {
        updateDoc("Raven Channel", channelID ?? null, {
            channel_name: data.channel_name
        }).then(() => {
            toast({
                title: "Channel name updated",
                status: "success",
                duration: 2000,
                isClosable: true
            })
            onClose(true)
        }).catch((err) => {
            toast({
                title: "Error renaming channel",
                description: err.message,
                status: "error",
                duration: 2000,
                isClosable: true
            })
        })
    }

    const handleClose = () => {
        //reset form on close
        reset()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>

                <ModalHeader>Rename this channel</ModalHeader>
                <ModalCloseButton isDisabled={updatingDoc} />

                <FormProvider {...methods}>
                    <chakra.form onSubmit={handleSubmit(onSubmit)}>

                        <ModalBody>
                            <Stack>

                                {error ? <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner> : null}

                                <FormControl isRequired isInvalid={!!errors.channel_name}>
                                    <Stack>
                                        <FormLabel htmlFor='channel_name'>Channel name</FormLabel>
                                        <InputGroup fontSize='sm'>
                                            <InputLeftElement
                                                pointerEvents='none'
                                                children={channelData[0].type === 'Private' ? <BiLockAlt /> : <BiHash />} />
                                            <Input {...register('channel_name', { required: "Please add a new channel name", maxLength: 80 })} />
                                        </InputGroup>
                                    </Stack>
                                    <FormHelperText fontSize='xs'>Names must be lowercase, without spaces or periods, and cannot be longer than 80 characters.</FormHelperText>
                                    <FormErrorMessage>{errors?.channel_name?.message}</FormErrorMessage>
                                </FormControl>

                            </Stack>
                        </ModalBody>

                        <ModalFooter>
                            <ButtonGroup>
                                <Button variant='outline' onClick={handleClose} isDisabled={updatingDoc}>Cancel</Button>
                                <Button colorScheme='blue' type='submit' isLoading={updatingDoc}>Save Changes</Button>
                            </ButtonGroup>
                        </ModalFooter>

                    </chakra.form>
                </FormProvider>

            </ModalContent>
        </Modal>
    )
}