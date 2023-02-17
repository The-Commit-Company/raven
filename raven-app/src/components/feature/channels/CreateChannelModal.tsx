import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, HStack, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Switch, Text, useToast } from '@chakra-ui/react'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiHash, BiLockAlt } from 'react-icons/bi'

interface ChannelModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void
}

interface ChannelCreationForm {
    channel_name: string,
    channel_description: string
    type: 'Public' | 'Private'
}

export const CreateChannelModal = ({ isOpen, onClose }: ChannelModalProps) => {

    const methods = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public'
        }
    })

    const { register, handleSubmit, watch, reset, formState: { errors } } = methods
    const { createDoc } = useFrappeCreateDoc()
    const toast = useToast()

    useEffect(() => {
        reset()
    }, [isOpen, reset])

    const channelType = watch('type')

    const onSubmit = (data: ChannelCreationForm) => {
        console.log(data)
        createDoc('Raven Channel', {
            ...data
        }).then(() => {
            onClose(true)
            toast({
                title: "Channel Created",
                status: "success",
                duration: 2000,
                isClosable: true
            })
        }).catch((err) => {
            toast({
                title: "Error creating channel",
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

    const onChannelTypeToggle = () => {
        methods.setValue('type', channelType === 'Private' ? 'Public' : 'Private')
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='2xl'>{channelType === 'Private' ? "Create a private channel" : "Create a channel"}</ModalHeader>
                <ModalCloseButton />

                <FormProvider {...methods}>
                    <chakra.form onSubmit={handleSubmit(onSubmit)}>

                        <ModalBody>
                            <Stack spacing={8}>
                                <Text fontSize='sm' fontWeight='light'>
                                    Channels are where your team communicates. They are best when organized around a topic - #development, for example.
                                </Text>

                                <Stack spacing={6}>
                                    <FormControl isRequired isInvalid={!!errors.channel_name}>
                                        <FormLabel>Name</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents='none'
                                                children={channelType === 'Private' ? <BiLockAlt /> : <BiHash />}
                                            />
                                            <Input autoFocus {...register('channel_name', { required: "Please add channel name", maxLength: 80 })}
                                                placeholder='e.g. testing' fontSize='sm' />
                                        </InputGroup>
                                        <FormErrorMessage>{errors.channel_name?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.channel_description}>
                                        <FormLabel>
                                            <HStack>
                                                <Text>Description</Text>
                                                <Text fontWeight='light' fontSize='sm'>(optional)</Text>
                                            </HStack>
                                        </FormLabel>
                                        <Input {...register('channel_description', { maxLength: 200 })} />
                                        <FormHelperText>What is this channel about?</FormHelperText>
                                        <FormErrorMessage>{errors.channel_description?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <HStack spacing={8} alignItems='center'>
                                            <Stack>
                                                <FormLabel htmlFor='email-alerts' mb='0'>
                                                    Make private?
                                                </FormLabel>
                                                {channelType === 'Private'
                                                    ?
                                                    <Text fontSize='sm' fontWeight='light'>
                                                        <strong>This cannot be undone.</strong> A private channel cannot be made public later on.
                                                    </Text>
                                                    :
                                                    <Text fontSize='sm' fontWeight='light'>
                                                        When a channel is set to private, it can only be viewed or joined by invitation.
                                                    </Text>
                                                }
                                            </Stack>
                                            <Switch id='type' pt='4' checked={channelType === 'Private'} onChange={onChannelTypeToggle} />
                                        </HStack>
                                    </FormControl>
                                </Stack>
                            </Stack>

                        </ModalBody>

                        <ModalFooter>
                            <ButtonGroup>
                                <Button variant='ghost' onClick={handleClose}>Cancel</Button>
                                <Button colorScheme='blue' type='submit'>Save</Button>
                            </ButtonGroup>
                        </ModalFooter>

                    </chakra.form>
                </FormProvider>

            </ModalContent>
        </Modal>
    )
}