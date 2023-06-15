import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, HStack, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, useToast } from '@chakra-ui/react'
import { useFrappePostCall } from 'frappe-react-sdk'
import { ChangeEvent, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { AlertBanner } from '../../layout/AlertBanner'

interface ChannelModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void
}

interface ChannelCreationForm {
    channel_name: string,
    channel_description: string
    type: 'Public' | 'Private' | 'Open'
}

export const CreateChannelModal = ({ isOpen, onClose }: ChannelModalProps) => {

    const methods = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public'
        }
    })

    const { register, handleSubmit, watch, reset, formState: { errors } } = methods
    const { call: callChannelCreation, loading: creatingChannel, error: channelCreationError, reset: resetChannelCreation, result: resultantChannel } = useFrappePostCall<{ message: string }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.create_channel')
    const toast = useToast()

    useEffect(() => {
        reset()
        resetChannelCreation()
    }, [isOpen, reset])

    const channelType = watch('type')

    let navigate = useNavigate()

    const onSubmit = (data: ChannelCreationForm) => {
        callChannelCreation({
            channel_name: data.channel_name,
            channel_description: data.channel_description,
            type: data.type
        }).then(result => {
            if (result) {
                toast({
                    title: "Channel Created",
                    status: "success",
                    duration: 2000,
                    isClosable: true
                })
                onClose(true)
                navigate(`/channel/${result.message}`)
            }
        }).catch((err) => {
            if (err.httpStatus === 409) {
                toast({
                    title: "Error creating channel",
                    description: "Channel name already exists",
                    status: "error",
                    duration: 2000,
                    isClosable: true
                })
            }
            else {
                toast({
                    title: "Error creating channel",
                    description: err.httpStatusText,
                    status: "error",
                    duration: 2000,
                    isClosable: true
                })
            }
        })
    }

    const handleClose = () => {
        //reset form on close
        reset()
        onClose()
        setValue('')
    }

    const [channelTypeValue, setChannelTypeValue] = useState<'Public' | 'Private' | 'Open'>('Public')
    const setChannelType = (value: 'Public' | 'Private' | 'Open') => {
        setChannelTypeValue(value)
        methods.setValue('type', value)
    }

    const [value, setValue] = useState('')
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value.replace(' ', '-'))

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='2xl'>
                    {channelType === 'Private' && "Create a private channel"}
                    {channelType === 'Open' && "Create an open channel"}
                    {channelType === 'Public' && "Create a public channel"}
                </ModalHeader>
                <ModalCloseButton isDisabled={creatingChannel} />
                <FormProvider {...methods}>
                    <chakra.form onSubmit={handleSubmit(onSubmit)}>

                        <ModalBody>
                            <Stack spacing={8}>

                                <Text fontSize='sm' fontWeight='light'>
                                    Channels are where your team communicates. They are best when organized around a topic - #development, for example.
                                </Text>

                                <Stack spacing={6}>

                                    {channelCreationError ? <AlertBanner status='error' heading={channelCreationError.message}>Channel name already exists</AlertBanner> : null}

                                    <FormControl isRequired isInvalid={!!errors.channel_name}>
                                        <FormLabel htmlFor='channel_name'>Name</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents='none'
                                                children={channelType === 'Private' && <BiLockAlt /> || channelType === 'Open' && <BiGlobe /> || channelType === 'Public' && <BiHash />}
                                            />
                                            <Input
                                                isInvalid={channelCreationError?.httpStatus === 409}
                                                maxLength={50}
                                                autoFocus {...register('channel_name', {
                                                    required: "Please add channel name",
                                                    maxLength: 50,
                                                    pattern: {
                                                        // no special characters allowed
                                                        // cannot start with a space
                                                        value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
                                                        message: "Channel name can only contain letters, numbers and hyphens."
                                                    }
                                                })}
                                                placeholder='e.g. testing' fontSize='sm'
                                                onChange={handleChange}
                                                value={value} />
                                            <InputRightElement>
                                                <Text fontSize='sm' fontWeight='light' color='gray.500'>{50 - value.length}</Text>
                                            </InputRightElement>
                                        </InputGroup>
                                        <FormErrorMessage>{errors.channel_name?.message}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.channel_description}>
                                        <FormLabel htmlFor='channel_description'>
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
                                        <Stack>
                                            <FormLabel htmlFor='channel_type' mb='0'>
                                                Channel Type
                                            </FormLabel>
                                            <RadioGroup id='type' onChange={setChannelType} value={channelTypeValue}>
                                                <Stack direction='row'>
                                                    <Radio value='Public'>Public</Radio>
                                                    <Radio value='Private'>Private</Radio>
                                                    <Radio value='Open'>Open</Radio>
                                                </Stack>
                                            </RadioGroup>
                                            {channelType === 'Private' &&
                                                <Text fontSize='xs' fontWeight='light'>
                                                    When a channel is set to private, it can only be viewed or joined by invitation.
                                                </Text>
                                            }
                                            {channelType === 'Public' &&
                                                <Text fontSize='xs' fontWeight='light'>
                                                    When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.
                                                </Text>
                                            }
                                            {channelType === 'Open' &&
                                                <Text fontSize='xs' fontWeight='light'>
                                                    When a channel is set to open, everyone is a member.
                                                </Text>
                                            }
                                        </Stack>
                                    </FormControl>
                                </Stack>
                            </Stack>

                        </ModalBody>

                        <ModalFooter>
                            <ButtonGroup>
                                <Button variant='ghost' onClick={handleClose} isDisabled={creatingChannel}>Cancel</Button>
                                <Button colorScheme='blue' type='submit' isLoading={creatingChannel}>Save</Button>
                            </ButtonGroup>
                        </ModalFooter>

                    </chakra.form>
                </FormProvider>

            </ModalContent>
        </Modal>
    )
}