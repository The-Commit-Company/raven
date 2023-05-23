import { Flex, VStack, Text, HStack, Link, Box, Stack, Avatar, Heading, Button, ButtonGroup, useDisclosure, useColorMode, AvatarBadge } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { BiGlobe, BiHash, BiLockAlt, BiUserPlus } from "react-icons/bi"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { TbEdit } from "react-icons/tb"
import { AddOrEditChannelDescriptionModal } from "../../feature/channel-details/EditChannelDetails/AddOrEditChannelDescriptionModal"
import { AddChannelMemberModal } from "../../feature/channels/AddChannelMemberModal"
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { UserProfileDrawer } from "../../feature/user-details/UserProfileDrawer"
import { ModalTypes, useModalManager } from "../../../hooks/useModalManager"

export const EmptyStateForSearch = () => {
    return (
        <Flex justify="center" align="center" height="50vh" width="full">
            <VStack>
                <Text fontWeight="bold" align="center" fontSize='md'>Nothing turned up</Text>
                <Text align="center" w="30vw" fontSize='sm'>You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                <HStack spacing={1}>
                    <Text fontSize='xs'>Not the results that you expected? File an issue on</Text>
                    <Link href="https://github.com/The-Commit-Company/Raven" target="_blank" rel="noreferrer">
                        <Text color='blue.500' fontSize='xs'>GitHub.</Text>
                    </Link>.
                </HStack>
            </VStack>
        </Flex>
    )
}

export const EmptyStateForChannel = () => {

    const { channelData } = useContext(ChannelContext)

    const modalManager = useModalManager()

    const onChannelDescriptionModalOpen = () => {
        modalManager.openModal(ModalTypes.EditChannelDescription)
    }

    const onAddMembersModalOpen = () => {
        modalManager.openModal(ModalTypes.AddChannelMember)
    }

    return (
        <>
            <Stack py='4' px='2'>
                <Stack spacing={1}>
                    <HStack alignItems={'center'} pb='1'>
                        {channelData?.type === 'Private' && <BiLockAlt fontSize={'1.4rem'} />}
                        {channelData?.type === 'Public' && <BiHash fontSize={'1.4rem'} />}
                        {channelData?.type === 'Open' && <BiGlobe fontSize={'1.4rem'} />}
                        <Heading size={'md'}>{channelData?.channel_name}</Heading>
                    </HStack>
                    <Text>{channelData?.owner_full_name} created this channel on {DateObjectToFormattedDateString(new Date(channelData?.creation ?? ''))}. This is the very beginning of the <strong>{channelData?.channel_name}</strong> channel.</Text>
                    {channelData?.channel_description && <Text fontSize={'sm'} color={'gray.500'}>{channelData?.channel_description}</Text>}
                </Stack>
                <ButtonGroup size={'xs'} colorScheme="blue" variant={'link'} spacing={4} zIndex={1}>
                    <Button leftIcon={<TbEdit fontSize={'1rem'} />} onClick={onChannelDescriptionModalOpen}>{channelData?.channel_description ? 'Edit' : 'Add'} description</Button>
                    {channelData?.type !== 'Open' && <Button leftIcon={<BiUserPlus fontSize={'1.1rem'} />} onClick={onAddMembersModalOpen}>Add people</Button>}
                </ButtonGroup>
            </Stack>
            <AddOrEditChannelDescriptionModal
                isOpen={modalManager.modalType === ModalTypes.EditChannelDescription}
                onClose={modalManager.closeModal} />
            <AddChannelMemberModal
                isOpen={modalManager.modalType === ModalTypes.AddChannelMember}
                onClose={modalManager.closeModal} />
        </>
    )
}


export const EmptyStateForDM = () => {

    const { channelMembers } = useContext(ChannelContext)
    const { channelData } = useContext(ChannelContext)
    const userData = useContext(UserDataContext)
    const user = userData?.name
    const peer = Object.keys(channelMembers).filter((member) => member !== user)[0]
    const { isOpen: isUserProfileDetailsDrawerOpen, onOpen: onUserProfileDetailsDrawerOpen, onClose: onUserProfileDetailsDrawerClose } = useDisclosure()

    const { colorMode } = useColorMode()
    const textColor = colorMode === 'light' ? 'gray.600' : 'gray.400'

    return (
        <Box py='4' px='2'>
            {channelData?.is_direct_message == 1 && channelData?.is_self_message == 0 &&
                <Stack>
                    <HStack>
                        <Avatar name={channelMembers?.[peer]?.full_name ?? peer} src={channelMembers?.[peer]?.user_image} borderRadius={'md'} boxSize='42px' />
                        <Stack spacing={0}>
                            <Text fontWeight={'semibold'}>{channelMembers?.[peer]?.full_name}</Text>
                            <Text fontSize={'xs'} color={textColor}>{channelMembers?.[peer]?.name}</Text>
                        </Stack>
                    </HStack>
                    <HStack spacing={1}>
                        <Text>This is a Direct Message channel between you and <strong>{channelMembers?.[peer]?.full_name ?? peer}</strong>. Check out their profile to learn more about them.</Text>
                        <Button variant='link' colorScheme="blue" zIndex={1} onClick={() => onUserProfileDetailsDrawerOpen()}>View profile</Button>
                    </HStack>
                    <UserProfileDrawer isOpen={isUserProfileDetailsDrawerOpen} onClose={onUserProfileDetailsDrawerClose} user={channelMembers?.[peer]} />
                </Stack>
            }
            {channelData?.is_self_message == 1 && user &&
                <Stack spacing={4}>
                    <HStack>
                        <Avatar name={channelMembers?.[user]?.full_name} src={channelMembers?.[user]?.user_image} borderRadius={'md'} boxSize='42px'>
                            <AvatarBadge boxSize='0.72em' bg='green.500' />
                        </Avatar>
                        <Stack spacing={0}>
                            <HStack spacing={1}><Text fontWeight={'semibold'}>{channelMembers?.[user]?.full_name}</Text><Text fontSize='sm' color='gray.500'>(You)</Text></HStack>
                            <Text fontSize={'xs'} color={textColor}>{channelMembers?.[user]?.name}</Text>
                        </Stack>
                    </HStack>
                    <Stack spacing={0}>
                        <Text><strong>This space is all yours.</strong> Draft messages, list your to-dos, or keep links and files handy. </Text>
                        <Text>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</Text>
                    </Stack>
                </Stack>
            }
        </Box>
    )
}