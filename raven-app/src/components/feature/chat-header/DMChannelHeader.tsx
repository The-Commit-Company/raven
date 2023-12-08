import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { SearchButton } from "./SearchButton"
import { Flex, Heading } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"

interface DMChannelHeaderProps {
    channelData: DMChannelListItem,
    channelMembers: ChannelMembers
}

export const DMChannelHeader = ({ channelData, channelMembers }: DMChannelHeaderProps) => {

    // There are two people in a DM channel, the user (you) and the peer (the other person)
    // If channelData.is_self_message is 1, then the user is having a conversation with themself

    const peer = channelData.peer_user_id
    const isActive = useIsUserActive(channelData.peer_user_id)

    return (
        <PageHeader>
            <Flex gap='2' align='center'>
                <UserAvatar
                    key={peer}
                    alt={channelMembers?.[peer]?.full_name ?? peer} src={channelMembers?.[peer]?.user_image ?? ''}
                    isActive={isActive}
                    skeletonSize='6'
                    size='2' />
                <Heading size='5'>{channelMembers?.[peer]?.full_name ?? peer}</Heading>
            </Flex>
            <SearchButton />
        </PageHeader>
    )
}