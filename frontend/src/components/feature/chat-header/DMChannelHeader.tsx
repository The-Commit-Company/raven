import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Badge, Flex, Heading } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useMemo } from "react"
import useFetchChannelMembers from "@/hooks/fetchers/useFetchChannelMembers"
import ChannelHeaderMenu from "./ChannelHeaderMenu"
import { BiChevronLeft } from "react-icons/bi"
import { Link } from "react-router-dom"
import { useGetUser } from "@/hooks/useGetUser"

interface DMChannelHeaderProps {
    channelData: DMChannelListItem,
}

export const DMChannelHeader = ({ channelData }: DMChannelHeaderProps) => {

    const { channelMembers } = useFetchChannelMembers(channelData.name)

    // There are two people in a DM channel, the user (you) and the peer (the other person)
    // If channelData.is_self_message is 1, then the user is having a conversation with themself

    const peer = channelData.peer_user_id
    const isActive = useIsUserActive(channelData.peer_user_id)

    const { isBot, fullName, userImage } = useMemo(() => {

        const peerUserData = channelMembers?.[peer]

        const isBot = peerUserData?.type === 'Bot'

        return {
            fullName: peerUserData?.full_name ?? peer,
            userImage: peerUserData?.user_image ?? '',
            isBot
        }

    }, [channelMembers, peer])

    const user = useGetUser(peer)

    return (
        <PageHeader>
            <Flex gap='3' align='center'>
                <Link to='/channel' className="block bg-transparent hover:bg-transparent active:bg-transparent sm:hidden">
                    <BiChevronLeft size='24' className="block text-gray-12" />
                </Link>
                <UserAvatar
                    key={peer}
                    alt={fullName}
                    src={userImage}
                    isActive={isActive}
                    availabilityStatus={user?.availability_status}
                    skeletonSize='6'
                    isBot={isBot}
                    size='2' />
                <Heading size='5'>
                    <div className="flex items-center gap-2">
                        {fullName}
                        {user?.custom_status && <Badge color='gray' className='font-semibold px-1.5 py-0.5'>{user.custom_status}</Badge>}
                        {isBot && <Badge color='gray' className='font-semibold px-1.5 py-0.5'>Bot</Badge>}
                    </div>
                </Heading>
            </Flex>
            <Flex gap='4' align='center'>
                <ChannelHeaderMenu channelData={channelData} />
            </Flex>
        </PageHeader>
    )
}