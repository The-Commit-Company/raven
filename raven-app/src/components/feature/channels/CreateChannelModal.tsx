import { Button, ButtonGroup, chakra, FormControl, FormErrorMessage, FormHelperText, FormLabel, HStack, Icon, Input, InputGroup, InputLeftElement, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { ChangeEvent, useCallback, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BiGlobe, BiHash, BiLockAlt } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { ErrorBanner } from '../../layout/AlertBanner'
import { SidebarButtonItem, SidebarItemLabel } from '@/components/layout/Sidebar'
import { IoAdd } from 'react-icons/io5'

export const CreateChannelButton = ({ updateChannelList }: { updateChannelList: VoidFunction }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    let navigate = useNavigate()

    const handleClose = (channel_name?: string) => {
        if (channel_name) {
            // Update channel list when name is provided.
            // Also navigate to new channel
            updateChannelList()
            navigate(`/channel/${channel_name}`)
        }
        onClose()
    }

    return <SidebarButtonItem onClick={onOpen}>
        <Icon as={IoAdd} fontSize={'md'} />
        <SidebarItemLabel>Add channel</SidebarItemLabel>
        <Modal isOpen={isOpen} onClose={handleClose} size='lg'>
            <ModalOverlay />
            <ModalContent>
                <CreateChannelModal onClose={handleClose} />
            </ModalContent>
        </Modal>
    </SidebarButtonItem>

}
interface ChannelModalProps {
    onClose: (channel_name?: string) => void
}

interface ChannelCreationForm {
    channel_name: string,
    channel_description: string,
    type: 'Public' | 'Private' | 'Open'
}

export const CreateChannelModal = ({ onClose }: ChannelModalProps) => {

    const methods = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public',
            channel_name: '',
            channel_description: ''
        }
    })

    const { register, handleSubmit, watch, formState: { errors }, control, setValue } = methods

    const { createDoc, error: channelCreationError, loading: creatingChannel } = useFrappeCreateDoc()
    const toast = useToast()

    const channelType = watch('type')

    const onSubmit = (data: ChannelCreationForm) => {
        createDoc('Raven Channel', data).then(result => {
            if (result) {
                toast({
                    title: "Channel Created",
                    status: "success",
                    duration: 2000,
                    isClosable: true
                })
                onClose(result.name)
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
        onClose()
    }
    const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setValue('channel_name', event.target.value?.toLowerCase().replace(' ', '-'))
    }, [setValue])

    const { channelIcon, header, helperText } = useMemo(() => {
        switch (channelType) {
            case 'Private':
                return {
                    channelIcon: <BiLockAlt />,
                    header: 'Create a private channel',
                    helperText: 'When a channel is set to private, it can only be viewed or joined by invitation.'
                }
            case 'Open':
                return {
                    channelIcon: <BiGlobe />,
                    header: 'Create an open channel',
                    helperText: 'When a channel is set to open, everyone is a member.'
                }
            default:
                return {
                    channelIcon: <BiHash />,
                    header: 'Create a public channel',
                    helperText: 'When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.'
                }
        }
    }, [channelType])

    return (
        <FormProvider {...methods}>
            <chakra.form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader fontSize='2xl'>
                    {header}
                </ModalHeader>
                <ModalCloseButton isDisabled={creatingChannel} />
                <ModalBody>
                    <Stack spacing={8}>

                        <Text fontSize='sm' fontWeight='light'>
                            Channels are where your team communicates. They are best when organized around a topic - #development, for example.
                        </Text>

                        <Stack spacing={6}>
                            <ErrorBanner error={channelCreationError} />
                            <FormControl isRequired isInvalid={!!errors.channel_name}>
                                <FormLabel htmlFor='channel_name'>Name</FormLabel>

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
                                                children={channelIcon}
                                            />
                                            <Input
                                                maxLength={50}
                                                autoFocus
                                                placeholder='e.g. testing' fontSize='sm'
                                                onChange={handleNameChange}
                                                value={field.value} />
                                            <InputRightElement>
                                                <Text fontSize='sm' fontWeight='light' color='gray.500'>{50 - field.value.length}</Text>
                                            </InputRightElement>
                                        </InputGroup>
                                    )}
                                />
                                <FormErrorMessage>{errors.channel_name?.message}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.channel_description}>
                                <FormLabel htmlFor='channel_description'>
                                    <HStack>
                                        <Text>Description</Text>
                                        <Text fontWeight='light' fontSize='sm'>(optional)</Text>
                                    </HStack>
                                </FormLabel>
                                <Input {...register('channel_description', {
                                    maxLength: {
                                        value: 200,
                                        message: "Channel description cannot be more than 200 characters."
                                    }
                                })} />
                                <FormHelperText>What is this channel about?</FormHelperText>
                                <FormErrorMessage>{errors.channel_description?.message}</FormErrorMessage>
                            </FormControl>

                            <FormControl>
                                <Stack>
                                    <FormLabel htmlFor='channel_type' mb='0'>
                                        Channel Type
                                    </FormLabel>
                                    <Controller
                                        name='type'
                                        control={control}
                                        render={({ field }) => (<RadioGroup id='type' onChange={field.onChange} value={field.value}>
                                            <Stack direction='row'>
                                                <Radio value='Public'>Public</Radio>
                                                <Radio value='Private'>Private</Radio>
                                                <Radio value='Open'>Open</Radio>
                                            </Stack>
                                        </RadioGroup>
                                        )}
                                    />
                                    <Text fontSize='xs' fontWeight='light'>
                                        {helperText}
                                    </Text>

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
    )
}