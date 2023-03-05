import { Text, Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, useToast } from "@chakra-ui/react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useContext, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
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
    const methods = useForm<RenameChannelForm>({
        defaultValues: {
            channel_name: channelData?.channel_name
        }
    })
    const { register, handleSubmit, reset, watch, formState: { errors } } = methods
    const { updateDoc, loading: updatingDoc, error, reset: resetUpdate } = useFrappeUpdateDoc()
    const toast = useToast()
    const channel_name = watch('channel_name')

    useEffect(() => {
        reset()
        resetUpdate()
    }, [isOpen, reset])

    const onSubmit = (data: RenameChannelForm) => {
        updateDoc("Raven Channel", channelData?.name ?? null, {
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
                                                children={channelData?.type === 'Private' && <BiLockAlt /> ||
                                                    channelData?.type === 'Public' && <BiHash /> ||
                                                    channelData?.type === 'Open' && <BiGlobe />} />
                                            {/* <Input {...register('channel_name', { required: "Please add a new channel name", maxLength: 80 })} /> */}
                                            <Input
                                                maxLength={50}
                                                autoFocus {...register('channel_name', {
                                                    required: "Please add channel name",
                                                    maxLength: 50,
                                                    pattern: {
                                                        // no special characters allowed
                                                        // cannot start with a space
                                                        value: /^[a-zA-Z0-9][a-zA-Z0-9]|-*$/,
                                                        message: "Channel name can only contain letters and numbers"
                                                    }
                                                })} />
                                            <InputRightElement>
                                                <Text fontSize='sm' fontWeight='light' color='gray.500'>{50 - channel_name?.length}</Text>
                                            </InputRightElement>
                                        </InputGroup>
                                    </Stack>
                                    <FormHelperText fontSize='xs'>Names cannot be longer than 50 characters.</FormHelperText>
                                    <FormErrorMessage>{errors?.channel_name?.message}</FormErrorMessage>
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