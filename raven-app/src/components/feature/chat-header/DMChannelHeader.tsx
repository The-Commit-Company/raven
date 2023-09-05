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
    const user = channelData.owner
    const isActive = useIsUserActive(channelData.peer_user_id)

    return (
        <PageHeader>
            <PageHeading>
                <DMChannelPageHeader
                    name={channelData.is_self_message === 0 ? peer : user}
                    full_name={channelData.is_self_message === 0 ? channelMembers?.[peer]?.full_name : channelMembers?.[user]?.full_name}
                    user_image={channelData.is_self_message === 0 ? channelMembers?.[peer]?.user_image ?? '' : channelMembers?.[user]?.user_image ?? ''}
                    isActive={isActive}
                    is_self_message={channelData.is_self_message as 1 | 0}
                />
            </PageHeading>
            <SearchButton />
        </PageHeader>
    )
}

interface DMChannelPageHeaderProps {
    name: string,
    full_name: string,
    user_image: string
    isActive: boolean,
    is_self_message: 1 | 0
}

const DMChannelPageHeader = ({ name, full_name, user_image, isActive, is_self_message }: DMChannelPageHeaderProps) => {
    return (
        <HStack>
            <Avatar key={name} name={full_name} src={user_image} borderRadius={'lg'} size="sm" >
                <AvatarBadge hidden={!is_self_message && !isActive} boxSize='0.88em' bg='green.500' />
            </Avatar>
            <Text>{full_name}</Text>
        </HStack>
    )
}