import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Textarea, useToast } from "@chakra-ui/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { ErrorBanner } from "../../../layout/AlertBanner"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"

interface RenameChannelModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void
    channelData: ChannelListItem
}

interface RenameChannelForm {
    channel_description: string
}

export const EditChannelDescriptionModal = ({ isOpen, onClose, channelData }: RenameChannelModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <EditChannelDescriptionModalForm channelData={channelData} onClose={onClose} />
            </ModalContent>
        </Modal>
    )
}

const EditChannelDescriptionModalForm = ({ channelData, onClose }: { channelData: ChannelListItem, onClose: () => void }) => {

    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_description: channelData?.channel_description
        }
    })
    const { register, handleSubmit, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()
    const toast = useToast()

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
            onClose()
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

    return (
        <FormProvider {...methods}>
            <chakra.form onSubmit={handleSubmit(onSubmit)}>

                <ModalHeader>{channelData && channelData?.channel_description && channelData?.channel_description.length > 0 ? 'Edit description' : 'Add description'}</ModalHeader>
                <ModalCloseButton isDisabled={updatingDoc} />

                <ModalBody>
                    <Stack>
                        <ErrorBanner error={error} />

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
                        <Button variant='ghost' onClick={onClose} isDisabled={updatingDoc}>Cancel</Button>
                        <Button colorScheme='blue' type='submit' isLoading={updatingDoc}>Save Changes</Button>
                    </ButtonGroup>
                </ModalFooter>

            </chakra.form>
        </FormProvider>
    )
}