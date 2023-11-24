import { Flex, VStack, Text, HStack, Link, Box, Stack, Avatar, Heading, Button, ButtonGroup, useDisclosure } from "@chakra-ui/react"
import { BiBookmark, BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { DateObjectToFormattedDateString } from "../../../utils/operations"
import { UserProfileDrawer } from "../../feature/user-details/UserProfileDrawer"
import { useUserData } from "@/hooks/useUserData"
import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { useContext } from "react"
import { ChannelMembers, ChannelMembersContext, ChannelMembersContextType } from "@/utils/channel/ChannelMembersProvider"
import { EditDescriptionButton } from "@/components/feature/channel-details/edit-channel-description/EditDescriptionButton"
import { AddMembersButton } from "@/components/feature/channel-member-details/add-members/AddMembersButton"
import { UserContext } from "@/utils/auth/UserProvider"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { useTheme } from "@/ThemeProvider"

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

interface EmptyStateForChannelProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

const EmptyStateForChannel = ({ channelData, channelMembers, updateMembers }: EmptyStateForChannelProps) => {

    const { currentUser } = useContext(UserContext)
    const users = useGetUserRecords()

    return (
        <Stack py='4' px='2'>
            <Stack spacing={1}>
                <HStack alignItems={'center'} pb='1'>
                    {channelData?.type === 'Private' && <BiLockAlt fontSize={'1.4rem'} />}
                    {channelData?.type === 'Public' && <BiHash fontSize={'1.4rem'} />}
                    {channelData?.type === 'Open' && <BiGlobe fontSize={'1.4rem'} />}
                    <Heading size={'md'}>{channelData?.channel_name}</Heading>
                </HStack>
                <Text>{users[channelData.owner]?.full_name} created this channel on {DateObjectToFormattedDateString(new Date(channelData?.creation ?? ''))}. This is the very beginning of the <strong>{channelData?.channel_name}</strong> channel.</Text>
                {channelData?.channel_description && <Text fontSize={'sm'} color={'gray.500'}>{channelData?.channel_description}</Text>}
            </Stack>
            {channelData?.is_archived == 0 && channelMembers[currentUser] && <ButtonGroup size={'xs'} colorScheme="blue" variant={'link'} spacing={4} zIndex={1}>
                <EditDescriptionButton channelData={channelData} />
                {channelData?.type !== 'Open' && <AddMembersButton channelData={channelData} updateMembers={updateMembers} />}
            </ButtonGroup>}
        </Stack>
    )
}

interface EmptyStateForDMProps {
    channelData: DMChannelListItem
}

const EmptyStateForDM = ({ channelData }: EmptyStateForDMProps) => {

    const peer = channelData.peer_user_id
    const users = useGetUserRecords()
    const { isOpen: isUserProfileDetailsDrawerOpen, onOpen: onUserProfileDetailsDrawerOpen, onClose: onUserProfileDetailsDrawerClose } = useDisclosure()

    const { appearance } = useTheme()
    const textColor = appearance === 'light' ? 'gray.600' : 'gray.400'

    return (
        <Box py='4' px='2'>
            {channelData?.is_direct_message == 1 &&
                <Stack>
                    <HStack>
                        <Avatar name={users?.[peer]?.full_name ?? peer} src={users?.[peer]?.user_image ?? ''} borderRadius={'md'} boxSize='42px' />
                        <Stack spacing={0}>
                            <Text fontWeight={'semibold'}>{users?.[peer]?.full_name}</Text>
                            <Text fontSize={'xs'} color={textColor}>{users?.[peer]?.name}</Text>
                        </Stack>
                    </HStack>
                    {channelData?.is_self_message == 1 ?
                        <Stack spacing={0}>
                            <Text><strong>This space is all yours.</strong> Draft messages, list your to-dos, or keep links and files handy. </Text>
                            <Text>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</Text>
                        </Stack>
                        :
                        <HStack spacing={1}>
                            <Text>This is a Direct Message channel between you and <strong>{users?.[peer]?.full_name ?? peer}</strong>. Check out their profile to learn more about them.</Text>
                            <Button variant='link' colorScheme="blue" zIndex={1} onClick={() => onUserProfileDetailsDrawerOpen()}>View profile</Button>
                        </HStack>
                    }
                    <UserProfileDrawer isOpen={isUserProfileDetailsDrawerOpen} onClose={onUserProfileDetailsDrawerClose} user={users?.[peer]} />
                </Stack>
            }
        </Box>
    )
}

export const EmptyStateForSavedMessages = () => {
    return (
        <Stack mt='75px' px='4' spacing={4}>
            <HStack>
                <BiBookmark fontSize={'1.4rem'} />
                <Heading size={'md'}>Your saved messages will appear here</Heading>
            </HStack>
            <Stack>
                <Text>Saved messages are a convenient way to keep track of important information or messages you want to refer back to later.</Text>
                <HStack spacing={1}>
                    <Text>You can save messages by simply clicking on the bookmark icon</Text>
                    <BiBookmark fontSize={'1rem'} />
                    <Text>in message actions.</Text>
                </HStack>
            </Stack>
        </Stack>
    )
}

interface ChannelHistoryFirstMessageProps {
    channelID: string
}

export const ChannelHistoryFirstMessage = ({ channelID }: ChannelHistoryFirstMessageProps) => {

    const { channel } = useCurrentChannelData(channelID)
    const { channelMembers, mutate: updateMembers } = useContext(ChannelMembersContext) as ChannelMembersContextType

    if (channel) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channel.type === "dm") {
            return <EmptyStateForDM channelData={channel.channelData} />
        }
        if (updateMembers) {
            return <EmptyStateForChannel channelData={channel.channelData} channelMembers={channelMembers} updateMembers={updateMembers} />
        }
    }

    return null
}