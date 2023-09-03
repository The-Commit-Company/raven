import { Text, Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, useToast, Icon } from "@chakra-ui/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { ChangeEvent, useCallback } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { ErrorBanner } from "../../../layout/AlertBanner"
import { getChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"

interface RenameChannelModalProps {
    isOpen: boolean,
    onClose: () => void,
    channelID: string,
    channel_name: string,
    type: ChannelListItem['type']
}

interface RenameChannelForm {
    channel_name: string
}

export const ChannelRenameModal = ({ isOpen, onClose, channelID, channel_name, type }: RenameChannelModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <RenameChannelModalContent channelID={channelID} channelName={channel_name} type={type} onClose={onClose} />
            </ModalContent>
        </Modal>
    )
}

interface RenameChannelModalContentProps {
    channelID: string,
    channelName: string,
    type: ChannelListItem['type'],
    onClose: () => void
}

const RenameChannelModalContent = ({ channelID, channelName, type, onClose }: RenameChannelModalContentProps) => {

    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_name: channelName
        }
    })
    const { control, handleSubmit, setValue, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error } = useFrappeUpdateDoc()
    const toast = useToast()

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
            onClose()
        }).catch((err) => {
            if (err.httpStatus === 409) {
                toast({
                    title: "Error renaming channel",
                    description: "Channel name already exists",
                    status: "error",
                    duration: 2000,
                    isClosable: true
                })
            }
            else {
                toast({
                    title: "Error renaming channel",
                    description: err.httpStatusText,
                    status: "error",
                    duration: 2000,
                    isClosable: true
                })
            }
        })
    }

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setValue('channel_name', event.target.value?.toLowerCase().replace(' ', '-'))
    }, [setValue])

    return (
        <FormProvider {...methods}>
            <chakra.form onSubmit={handleSubmit(onSubmit)}>

                <ModalHeader>Rename this channel</ModalHeader>
                <ModalCloseButton isDisabled={updatingDoc} />

                <ModalBody>
                    <Stack>
                        <ErrorBanner error={error} />
                        <FormControl isRequired isInvalid={!!errors.channel_name}>
                            <FormLabel htmlFor='channel_name'>Channel name</FormLabel>
                            <Controller
                                name='channel_name'
                                control={control}
                                rules={{
                                    required: "Please add a channel name",
                                    maxLength: 50,
                                    pattern: {
                                        // no special characters allowed
                                        // cannot start with a space
                                        value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                        message: "Channel name can only contain letters, numbers and hyphens."
                                    }
                                }}
                                render={({ field }) => (
                                    <InputGroup>
                                        <InputLeftElement
                                            pointerEvents='none'
                                            children={<Icon as={getChannelIcon(type)} />}
                                        />
                                        <Input
                                            maxLength={50}
                                            autoFocus
                                            placeholder='e.g. testing' fontSize='sm'
                                            onChange={handleChange}
                                            value={field.value} />
                                        <InputRightElement>
                                            <Text fontSize='sm' fontWeight='light' color='gray.500'>{50 - field.value.length}</Text>
                                        </InputRightElement>
                                    </InputGroup>
                                )}
                            />
                            <FormHelperText fontSize='xs'>Names cannot be longer than 50 characters.</FormHelperText>
                            <FormErrorMessage>{errors?.channel_name?.message}</FormErrorMessage>
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