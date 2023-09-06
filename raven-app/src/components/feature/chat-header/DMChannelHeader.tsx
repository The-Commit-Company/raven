import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { PageHeading } from "@/components/layout/Heading/PageHeading"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { Text, Avatar, AvatarBadge, HStack } from "@chakra-ui/react"
import { SearchButton } from "./SearchButton"

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
            <PageHeading>
                <HStack>
                    <Avatar key={peer} name={channelMembers?.[peer]?.full_name ?? peer} src={channelMembers?.[peer]?.user_image ?? ''} borderRadius={'lg'} size="sm" >
                        <AvatarBadge hidden={!isActive} boxSize='0.88em' bg='green.500' />
                    </Avatar>
                    <Text>{channelMembers?.[peer]?.full_name ?? peer}</Text>
                </HStack>
            </PageHeading>
            <SearchButton />
        </PageHeader>
    )
}