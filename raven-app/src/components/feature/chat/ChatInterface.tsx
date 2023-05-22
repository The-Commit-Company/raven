import { Avatar, AvatarBadge, Box, Button, ButtonGroup, Center, HStack, Stack, Text, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { useFrappeCreateDoc, useFrappeGetCall } from "frappe-react-sdk"
import { useContext } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { HiOutlineSearch } from "react-icons/hi"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { ChannelData } from "../../../types/Channel/Channel"
import { MessagesWithDate } from "../../../types/Messaging/Message"
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

export const ChatInterface = () => {

    const { channelData, channelMembers } = useContext(ChannelContext)
    const userData = useContext(UserDataContext)
    const user = userData?.name
    const peer = Object.keys(channelMembers).filter((member) => member !== user)[0]
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const { data, error, mutate } = useFrappeGetCall<{ message: MessagesWithDate }>("raven.raven_messaging.doctype.raven_message.raven_message.get_messages_by_date", {
        channel_id: channelData?.name ?? null,
        start_after: 0,
        limit: 20
    })

    const lastMessage = useMemo(() => {
        if (data) {
            return Object.keys(data.message)[0]
        } else {
            return null
        }
    }, [data])

    console.log(data)

    const handelInfiniteScroll = async () => {
        var scrollHeight = document.getElementById('scrollable-stack')?.scrollHeight
        var innerHeight = document.getElementById('scrollable-stack')?.clientHeight
        var scrollTop = document.getElementById('scrollable-stack')?.scrollTop
        try {
            if (scrollHeight && innerHeight && scrollTop &&
                scrollHeight - innerHeight + scrollTop <= 10
            ) {
                setOldestMessageCreation(lastMessage)
                await mutate()
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        document.getElementById('scrollable-stack')?.addEventListener("scroll", handelInfiniteScroll)
        return () => document.getElementById('scrollable-stack')?.removeEventListener("scroll", handelInfiniteScroll)
    }, [])

    const { colorMode } = useColorMode()

    useFrappeEventListener('message_received', (data) => {
        if (data.channel_id === channelData?.name) {
            mutate()
        }
    })

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

    const allMembers = Object.values(channelMembers).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
    })

    const allChannels = channelList?.message.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })

    const modalManager = useModalManager()

    const onAddMemberModalOpen = () => {
        modalManager.openModal(ModalTypes.AddChannelMember)
    }

    const { isOpen: isViewDetailsModalOpen, onOpen: onViewDetailsModalOpen, onClose: onViewDetailsModalClose } = useDisclosure()
    const { isOpen: isCommandPaletteOpen, onClose: onCommandPaletteClose, onToggle: onCommandPaletteToggle } = useDisclosure()

    const { createDoc, error: joinError } = useFrappeCreateDoc()
    const toast = useToast()
    const { data: activeUsers, error: activeUsersError } = useFrappeGetCall<{ message: string[] }>('raven.api.user_availability.get_active_users')

    const joinChannel = () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: user
        }).then(() => {
            toast({
                title: 'Channel joined successfully',
                status: 'success',
                duration: 1000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
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

    else if (allChannels && allMembers) return (
        <>
            <PageHeader>
                {channelData && user &&
                    <PageHeading>
                        <HStack>
                            {channelData.is_direct_message == 1
                                ?
                                (channelData.is_self_message == 0 ?
                                    <HStack>
                                        <Avatar name={channelMembers?.[peer]?.full_name} src={channelMembers?.[peer]?.user_image} borderRadius={'lg'} size="sm" >
                                            {activeUsers?.message.includes(peer) && !!!activeUsersError && <AvatarBadge boxSize='0.88em' bg='green.500' />}
                                        </Avatar>
                                        <Text>{channelMembers?.[peer]?.full_name}</Text>
                                    </HStack> :
                                    <HStack>
                                        <Avatar name={channelMembers?.[user]?.full_name} src={channelMembers?.[user]?.user_image} borderRadius={'lg'} size="sm">
                                            <AvatarBadge boxSize='0.88em' bg='green.500' />
                                        </Avatar>
                                        <Text>{channelMembers?.[user]?.full_name}</Text><Text fontSize='sm' color='gray.500'>(You)</Text>
                                    </HStack>) :
                                (channelData?.type === 'Private' &&
                                    <HStack><BiLockAlt /><Text>{channelData?.channel_name}</Text></HStack> ||
                                    channelData?.type === 'Public' &&
                                    <HStack><BiHash /><Text>{channelData?.channel_name}</Text></HStack> ||
                                    channelData?.type === 'Open' &&
                                    <HStack><BiGlobe /><Text>{channelData?.channel_name}</Text></HStack>
                                )}
                        </HStack>
                    </PageHeading>
                }
                <HStack>
                    <Button
                        size={"sm"}
                        aria-label="search"
                        leftIcon={<HiOutlineSearch />}
                        onClick={onCommandPaletteToggle}
                        fontWeight='light'>
                        Search
                    </Button>
                    {channelData?.is_direct_message == 0 && activeUsers?.message &&
                        <ViewOrAddMembersButton onClickViewMembers={onViewDetailsModalOpen} onClickAddMembers={onAddMemberModalOpen} activeUsers={activeUsers.message} />}
                </HStack>
            </PageHeader>
            <Stack h='calc(100vh)' justify={'flex-end'} p={4} overflow='hidden' pt='16'>
                {data && channelData && <ChatHistory parsed_messages={data.message} isDM={channelData?.is_direct_message} />}
                {channelData?.is_archived == 0 && ((user && user in channelMembers) || channelData?.type === 'Open' ?
                    <ChatInput channelID={channelData?.name ?? ''} allChannels={allChannels} allMembers={allMembers} /> :
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