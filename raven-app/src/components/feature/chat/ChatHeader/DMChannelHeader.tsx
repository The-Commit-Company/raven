import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { PageHeading } from "@/components/layout/Heading/PageHeading"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { ChannelMembers } from "@/pages/ChatSpace"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { Text, Avatar, AvatarBadge, HStack } from "@chakra-ui/react"

interface DMChannelHeaderProps {
    channelData: DMChannelListItem,
    channelMembers: ChannelMembers
}

export const DMChannelHeader = ({ channelData, channelMembers }: DMChannelHeaderProps) => {

    const peer = channelData.peer_user_id
    const user = channelData.owner
    const isActive = useIsUserActive(channelData.peer_user_id)

    return (
        <PageHeader>
            <PageHeading>
                {channelData.is_self_message === 0 ?
                    <HStack>
                        <Avatar key={peer} name={channelMembers?.[peer]?.full_name} src={channelMembers?.[peer]?.user_image ?? ''} borderRadius={'lg'} size="sm" >
                            <AvatarBadge hidden={!isActive} boxSize='0.88em' bg='green.500' />
                        </Avatar>
                        <Text>{channelMembers?.[peer]?.full_name}</Text>
                    </HStack> :
                    <HStack>
                        <Avatar key={user} name={channelMembers?.[user]?.full_name} src={channelMembers?.[user]?.user_image ?? ''} borderRadius={'lg'} size="sm">
                            <AvatarBadge boxSize='0.88em' bg='green.500' />
                        </Avatar>
                        <Text>{channelMembers?.[user]?.full_name}</Text><Text fontSize='sm' color='gray.500'>(You)</Text>
                    </HStack>}
            </PageHeading>
        </PageHeader>
    )
}