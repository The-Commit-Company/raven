import { Avatar, AvatarBadge, Box, Button, ButtonGroup, Center, HStack, IconButton, Stack, Text, Tooltip, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { useFrappeCreateDoc, useFrappeGetCall } from "frappe-react-sdk"
import { useContext, useState } from "react"
import { BiEditAlt, BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { HiOutlineSearch } from "react-icons/hi"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { Message, MessagesWithDate } from "../../../types/Messaging/Message"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { PageHeading } from "../../layout/Heading/PageHeading"
import { FullPageLoader } from "../../layout/Loaders"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
import { ViewChannelDetailsModal } from "../channels/ViewChannelDetailsModal"
import { CommandPalette } from "../command-palette"
import { ViewOrAddMembersButton } from "../view-or-add-members/ViewOrAddMembersButton"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"
import { ChannelRenameModal } from "../channel-details/EditChannelDetails/ChannelRenameModal"
import { RavenChannel } from "../../../types/RavenChannelManagement/RavenChannel"

type value = {
    id: string,
    value: string
}

export const ChatInterface = () => {

    const { channelData, channelMembers, users } = useContext(ChannelContext)
    const userData = useContext(UserDataContext)
    const user = userData?.name
    const peer = Object.keys(channelMembers).filter((member) => member !== user)[0]
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: RavenChannel[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list", undefined, undefined, {
        revalidateOnFocus: false
    })

    const { data, error, mutate } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_with_dates", {
        channel_id: channelData?.name ?? null
    }, undefined, {
        revalidateOnFocus: false
    })

    const { colorMode } = useColorMode()

    useFrappeEventListener('message_deleted', (data) => {
        if (data.channel_id === channelData?.name) {
            mutate()
        }
    })

    useFrappeEventListener('message_updated', (data) => {
        if (data.channel_id === channelData?.name) {
            mutate()
        }
    })

    const allUsers: value[] = Object.values(users).map((user) => {
        return {
            id: user.name,
            value: user.full_name ?? user.name
        }
    })

    const allChannels: value[] = channelList ? channelList.message.map((channel: RavenChannel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    }) : []

    const modalManager = useModalManager()

    const onAddMemberModalOpen = () => {
        modalManager.openModal(ModalTypes.AddChannelMember)
    }

    const onRenameChannelModalOpen = () => {
        modalManager.openModal(ModalTypes.RenameChannel)
    }

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const handleReplyAction = (message: Message) => {
        setSelectedMessage(message)
    }

    const handleCancelReply = () => {
        setSelectedMessage(null)
    }

    const { isOpen: isViewDetailsModalOpen, onOpen: onViewDetailsModalOpen, onClose: onViewDetailsModalClose } = useDisclosure()
    const { isOpen: isCommandPaletteOpen, onClose: onCommandPaletteClose, onToggle: onCommandPaletteToggle } = useDisclosure()

    const { createDoc, error: joinError } = useFrappeCreateDoc()
    const toast = useToast()
    const { data: activeUsers, error: activeUsersError } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users', undefined, undefined, {
        revalidateOnFocus: false
    })

    const joinChannel = () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: user
        }).then(() => {
            mutate()
        }).catch((e) => {
            toast({
                title: 'Error: could not join channel.',
                status: 'error',
                duration: 3000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true,
                description: `${e.message}`
            })
        })
    }

    if (error) {
        return (
            <Box p={4}>
                <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
            </Box>
        )
    }

    else if (allChannels && allUsers) return (
        <>
            <PageHeader>
                {channelData && user &&
                    <PageHeading>
                        <HStack>
                            {channelData.is_direct_message == 1
                                ?
                                (channelData.is_self_message == 0 ?
                                    <HStack>
                                        <Avatar key={channelMembers?.[peer]?.full_name} name={channelMembers?.[peer]?.full_name} src={channelMembers?.[peer]?.user_image} borderRadius={'lg'} size="sm" >
                                            {activeUsers?.message.includes(peer) && !!!activeUsersError && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                                        </Avatar>
                                        <Text>{channelMembers?.[peer]?.full_name}</Text>
                                    </HStack> :
                                    <HStack>
                                        <Avatar key={channelMembers?.[user]?.full_name} name={channelMembers?.[user]?.full_name} src={channelMembers?.[user]?.user_image} borderRadius={'lg'} size="sm">
                                            <AvatarBadge boxSize='0.88em' bg='green.500' />
                                        </Avatar>
                                        <Text>{channelMembers?.[user]?.full_name}</Text><Text fontSize='sm' color='gray.500'>(You)</Text>
                                    </HStack>) :
                                <HStack>
                                    {channelData?.type === 'Private' &&
                                        <HStack><BiLockAlt /><Text>{channelData?.channel_name}</Text></HStack> ||
                                        channelData?.type === 'Public' &&
                                        <HStack><BiHash /><Text>{channelData?.channel_name}</Text></HStack> ||
                                        channelData?.type === 'Open' &&
                                        <HStack><BiGlobe /><Text>{channelData?.channel_name}</Text></HStack>
                                    }
                                    <Tooltip hasArrow label='edit channel name' placement="bottom" rounded='md'>
                                        <IconButton
                                            aria-label="edit-channel-name"
                                            icon={<BiEditAlt />}
                                            onClick={onRenameChannelModalOpen}
                                            size='sm'
                                            variant='ghost'
                                        />
                                    </Tooltip>
                                </HStack>}
                        </HStack>
                    </PageHeading>
                }
                <HStack>
                    <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                        <Button
                            size={"sm"}
                            aria-label="search"
                            leftIcon={<HiOutlineSearch />}
                            onClick={onCommandPaletteToggle}
                            fontWeight='light'>
                            Search
                        </Button>
                    </Tooltip>
                    {channelData?.is_direct_message == 0 && activeUsers?.message &&
                        <ViewOrAddMembersButton onClickViewMembers={onViewDetailsModalOpen} onClickAddMembers={onAddMemberModalOpen} activeUsers={activeUsers.message} />}
                </HStack>
            </PageHeader>
            <Stack h='calc(100vh)' justify={'flex-end'} p={4} overflow='hidden' pt='16'>
                {data && channelData && <ChatHistory parsed_messages={data.message} isDM={channelData.is_direct_message ?? 0} mutate={mutate} replyToMessage={handleReplyAction} />}
                {channelData?.is_archived == 0 && ((user && user in channelMembers) || channelData?.type === 'Open' ?
                    <ChatInput channelID={channelData?.name ?? ''} allChannels={allChannels} allUsers={allUsers} selectedMessage={selectedMessage} handleCancelReply={handleCancelReply} /> :
                    <Box>
                        <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                            <HStack justify='center' align='center' pb={4}><BiHash /><Text>{channelData?.channel_name}</Text></HStack>
                            <Center>
                                <ButtonGroup>
                                    <Button colorScheme='blue' variant='outline' size='sm' onClick={onViewDetailsModalOpen}>Details</Button>
                                    <Button colorScheme='blue' variant='solid' size='sm' onClick={joinChannel}>Join Channel</Button>
                                </ButtonGroup>
                            </Center>
                        </Stack>
                    </Box>)}
                {channelData && channelData.is_archived == 1 && <Box>
                    <Stack border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                        <HStack justify='center' align='center' pb={4}><BiHash /><Text>{channelData?.channel_name}</Text></HStack>
                        <Center>
                            <Text>This channel has been archived.</Text>
                        </Center>
                    </Stack>
                </Box>}
            </Stack>
            {activeUsers?.message && <ViewChannelDetailsModal
                isOpen={isViewDetailsModalOpen}
                onClose={onViewDetailsModalClose}
                activeUsers={activeUsers.message} />}
            <AddChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.AddChannelMember}
                onClose={modalManager.closeModal} />
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={onCommandPaletteClose}
                onToggle={onCommandPaletteToggle} />
            <ChannelRenameModal
                isOpen={modalManager.modalType === ModalTypes.RenameChannel}
                onClose={modalManager.closeModal}
            />

        </>
    )

    else if (channelListError) return (
        <Box p={4}>
            <AlertBanner status='error' heading={channelListError.message}>{channelListError.httpStatus}: {channelListError.httpStatusText}</AlertBanner>
        </Box>
    )

    else return (
        <FullPageLoader />
    )
}