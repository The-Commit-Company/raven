import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Textarea, useToast } from "@chakra-ui/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useContext, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ChannelContext } from "../../../../utils/channel/ChannelProvider"
import { AlertBanner } from "../../../layout/AlertBanner"

interface RenameChannelModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void
}

interface RenameChannelForm {
    channel_description: string
}

export const AddOrEditChannelDescriptionModal = ({ isOpen, onClose }: RenameChannelModalProps) => {

    const { channelData } = useContext(ChannelContext)
    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_description: channelData?.channel_description
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
        updateDoc("Raven Channel", channelData?.name ?? null, {
            channel_description: data.channel_description
        }).then(() => {
            toast({
                title: "Channel description updated",
                status: "success",
                duration: 2000,
                isClosable: true
            })
            onClose(true)
        }).catch((err) => {
            toast({
                title: "Error updating channel description",
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

                <ModalHeader>{channelData && channelData?.channel_description && channelData?.channel_description.length > 0 ? 'Edit description' : 'Add description'}</ModalHeader>
                <ModalCloseButton isDisabled={updatingDoc} />

                <FormProvider {...methods}>
                    <chakra.form onSubmit={handleSubmit(onSubmit)}>

                        <ModalBody>
                            <Stack>

                                {error ? <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner> : null}

                                <FormControl isRequired isInvalid={!!errors.channel_description}>
                                    <Stack>
                                        <FormLabel htmlFor='channel_description'>Channel description</FormLabel>
                                        <Textarea {...register('channel_description', { required: "Add a description", maxLength: 200 })}
                                            placeholder='Add a description' />
                                    </Stack>
                                    <FormHelperText fontSize='xs'>This is how people will know what this channel is about. (Description cannot be longer than 200 characters)</FormHelperText>
                                    <FormErrorMessage>{errors?.channel_description?.message}</FormErrorMessage>
                                </FormControl>

                            </Stack>
                        </ModalBody>

                        <ModalFooter>
                            <ButtonGroup>
                                <Button variant='ghost' onClick={handleClose} isDisabled={updatingDoc}>Cancel</Button>
                                <Button colorScheme='blue' type='submit' isLoading={updatingDoc}>Save Changes</Button>
                            </ButtonGroup>
                        </ModalFooter>

                    </chakra.form>
                </FormProvider>

            </ModalContent>
        </Modal>
    )
}