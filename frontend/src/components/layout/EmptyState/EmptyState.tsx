import { ChannelListItem, DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { useCurrentChannelData } from "@/hooks/useCurrentChannelData"
import { useContext, useMemo } from "react"
import { EditDescriptionButton } from "@/components/feature/channel-details/edit-channel-description/EditDescriptionButton"
import { AddMembersButton } from "@/components/feature/channel-member-details/add-members/AddMembersButton"
import { UserContext } from "@/utils/auth/UserProvider"
import { useGetUserRecords } from "@/hooks/useGetUserRecords"
import { Badge, Box, Flex, Heading, Link, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { BiBookmark } from "react-icons/bi"
import { DateMonthYear } from "@/utils/dateConversions"
import { useGetUser } from "@/hooks/useGetUser"
import useFetchChannelMembers from "@/hooks/fetchers/useFetchChannelMembers"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { replaceCurrentUserFromDMChannelName } from "@/utils/operations"

export const EmptyStateForSearch = () => {
    return (
        <Flex justify="center" align="center" className={'w-full h-64'}>
            <Flex direction='column' gap='1' className="text-center">
                <Text weight="bold" size='5'>Nothing turned up</Text>
                <Text as='span' size='2'>You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                <Text as='span' size='2'>Not the results that you expected? File an issue on <Link href="https://github.com/The-Commit-Company/Raven" target="_blank" rel="noreferrer">
                    <Text color='blue' size='2'>GitHub</Text>
                </Link>.
                </Text>
            </Flex>
        </Flex>
    )
}

interface EmptyStateForChannelProps {
    channelData: ChannelListItem,
}

const EmptyStateForChannel = ({ channelData }: EmptyStateForChannelProps) => {

    const { channelMembers } = useFetchChannelMembers(channelData.name)

    const { currentUser } = useContext(UserContext)
    const users = useGetUserRecords()

    const { isAdmin } = useMemo(() => {
        const channelMember = channelMembers[currentUser]
        return {
            isAdmin: channelMember?.is_admin == 1
        }
    }, [channelMembers, currentUser])

    return (
        <Flex direction='column' className={'p-2'} gap='2'>
            <Flex direction='column' gap='2'>
                <Flex align={'center'} gap='1'>
                    <ChannelIcon type={channelData?.type} />
                    <Heading size='4'>{channelData?.channel_name}</Heading>
                </Flex>
                <Text size='2'>{users[channelData.owner]?.full_name} created this channel on <DateMonthYear date={channelData?.creation} />. This is the very beginning of the <strong>{channelData?.channel_name}</strong> channel.</Text>
                {channelData?.channel_description && <Text size={'1'} color='gray'>{channelData?.channel_description}</Text>}
            </Flex>
            {channelData?.is_archived == 0 && isAdmin && <Flex gap='4' className={'z-1'}>
                <EditDescriptionButton channelData={channelData} />
                {channelData?.type !== 'Open' && <AddMembersButton channelData={channelData} />}
            </Flex>}
        </Flex>
    )
}

interface EmptyStateForDMProps {
    channelData: DMChannelListItem
}

const EmptyStateForDM = ({ channelData }: EmptyStateForDMProps) => {

    const { currentUser } = useContext(UserContext)

    const peer = channelData.peer_user_id

    const peerData = useGetUser(peer)

    const { fullName, userImage, isBot } = useMemo(() => {
        const isBot = peerData?.type === 'Bot'
        return {
            fullName: peerData?.full_name ?? peer,
            userImage: peerData?.user_image ?? '',
            isBot
        }
    }, [peerData, peer])

    const isActive = useIsUserActive(peer)

    const userName = fullName ?? peer ?? replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUser)

    return (
        <Box className={'p-2'}>
            {channelData?.is_direct_message == 1 &&
                <Flex direction='column' gap='3'>
                    <Flex gap='3' align='center'>
                        <UserAvatar alt={userName} src={userImage} size='3' skeletonSize='7' isBot={isBot} availabilityStatus={peerData?.availability_status} isActive={isActive} />
                        <Flex direction='column' gap='0'>
                            <Heading size='4'>{userName}</Heading>
                            <div>
                                {isBot ? <Badge color='gray' className="py-0 px-1">Bot</Badge> : <Text size='1' color='gray'>{peer}</Text>}
                            </div>
                        </Flex>
                    </Flex>
                    {channelData?.is_self_message == 1 ?
                        <Flex direction='column' gap='0'>
                            <Text size='2'><strong>This space is all yours.</strong> Draft messages, list your to-dos, or keep links and files handy. </Text>
                            <Text size='2'>And if you ever feel like talking to yourself, don't worry, we won't judge - just remember to bring your own banter to the table.</Text>
                        </Flex>
                        :
                        <Flex gap='2' align='center'>
                            {peer || fullName ?
                                <Text size='2'>This is a Direct Message channel between you and <strong>{fullName ?? peer}</strong>.</Text>
                                :
                                <Text size='2'>We could not find the user for this DM channel ({replaceCurrentUserFromDMChannelName(channelData.channel_name, currentUser)}).</Text>
                            }
                        </Flex>
                    }
                </Flex>
            }
        </Box>
    )
}

export const EmptyStateForSavedMessages = () => {
    return (
        <Box className={'py-2 px-6'}>
            <Flex direction='column' gap='2'>
                <Text size='3'><strong>Your saved messages will appear here</strong></Text>
                <Flex direction='column' gap='1'>
                    <Text size='2' as='span'>Saved messages are a convenient way to keep track of important information or messages you want to refer back to later.</Text>
                    <Text size='2' as='span'>
                        You can save messages by simply clicking on the bookmark icon <BiBookmark className={'-mb-0.5'} /> in message actions.
                    </Text>
                </Flex>
            </Flex>
        </Box>
    )
}

export const EmptyStateForThreads = () => {
    return (
        <Box className={'py-2 px-6'}>
            <Flex direction='column' gap='2'>
                <Text size='3'><strong>No threads to show</strong></Text>
                <Flex direction='column' gap='1'>
                    <Text as='span' size='2'>Threads are a way to keep conversations organized and focused. You can create a thread by replying to a message.</Text>
                    <Text as='span' size='2'>You can also start a thread by clicking on the <strong>Create Thread</strong> button on any message.</Text>
                </Flex>
            </Flex>
        </Box>
    )
}

interface ChannelHistoryFirstMessageProps {
    channelID: string
}

export const ChannelHistoryFirstMessage = ({ channelID }: ChannelHistoryFirstMessageProps) => {

    const { channel } = useCurrentChannelData(channelID)

    if (channel) {
        // depending on whether channel is a DM or a channel, render the appropriate component
        if (channel.type === "dm") {
            return <EmptyStateForDM channelData={channel.channelData} />
        }
        else {
            return <EmptyStateForChannel channelData={channel.channelData} />
        }
    }

    return null
}