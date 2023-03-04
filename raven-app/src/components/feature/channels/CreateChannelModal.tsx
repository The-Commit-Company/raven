import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, HStack, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Switch, Text, useToast } from '@chakra-ui/react'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useEffect, useState } from 'react'
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
    const { createDoc, error, loading: creatingDoc, reset: resetCreate } = useFrappeCreateDoc()
    const toast = useToast()

    useEffect(() => {
        reset()
        resetCreate()
    }, [isOpen, reset])

    const channelType = watch('type')
    const channel_name = watch('channel_name')

    let navigate = useNavigate()

    const onSubmit = (data: ChannelCreationForm) => {
        let docname = ""
        createDoc('Raven Channel', {
            ...data
        }).then((d) => {
            docname = d.name
            navigate('/channel/' + docname)
            toast({
                title: "Channel Created",
                status: "success",
                duration: 2000,
                isClosable: true
            })
            onClose(true)
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

    const [channelTypeValue, setChannelTypeValue] = useState<'Public' | 'Private' | 'Open'>('Public')
    const setChannelType = (value: 'Public' | 'Private' | 'Open') => {
        setChannelTypeValue(value)
        methods.setValue('type', value)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize='2xl'>
                    {channelType === 'Private' && "Create a private channel"}
                    {channelType === 'Open' && "Create an open channel"}
                    {channelType === 'Public' && "Create a public channel"}
                </ModalHeader>
                <ModalCloseButton isDisabled={creatingDoc} />

                <FormProvider {...methods}>
                    <chakra.form onSubmit={handleSubmit(onSubmit)}>

                        <ModalBody>
                            <Stack spacing={8}>

                                <Text fontSize='sm' fontWeight='light'>
                                    Channels are where your team communicates. They are best when organized around a topic - #development, for example.
                                </Text>

                                <Stack spacing={6}>

                                    {error ? <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner> : null}

                                    <FormControl isRequired isInvalid={!!errors.channel_name}>
                                        <FormLabel>Name</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement
                                                pointerEvents='none'
                                                children={channelType === 'Private' && <BiLockAlt /> || channelType === 'Open' && <BiGlobe /> || channelType === 'Public' && <BiHash />}
                                            />
                                            <Input
                                                maxLength={50}
                                                autoFocus {...register('channel_name', {
                                                    required: "Please add channel name",
                                                    maxLength: 50,
                                                    pattern: {
                                                        // no special characters allowed
                                                        // cannot start with a space
                                                        value: /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/,
                                                        message: "Channel name can only contain letters and numbers"
                                                    }
                                                })}
                                                placeholder='e.g. testing' fontSize='sm' />
                                            <InputRightElement>
                                                <Text fontSize='sm' fontWeight='light' color='gray.500'>{50 - channel_name?.length}</Text>
                                            </InputRightElement>
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
                                        <Stack>
                                            <FormLabel htmlFor='email-alerts' mb='0'>
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
                                                    <strong>This cannot be undone.</strong>
                                                    When a channel is set to private, it can only be viewed or joined by invitation.
                                                    A private channel cannot be made public later on.
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
                                <Button variant='ghost' onClick={handleClose} isDisabled={creatingDoc}>Cancel</Button>
                                <Button colorScheme='blue' type='submit' isLoading={creatingDoc}>Save</Button>
                            </ButtonGroup>
                        </ModalFooter>

                    </chakra.form>
                </FormProvider>

            </ModalContent>
        </Modal>
    )
}