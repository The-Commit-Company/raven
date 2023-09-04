import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { PageHeading } from "@/components/layout/Heading/PageHeading"
import { Text, HStack, Icon } from "@chakra-ui/react"
import { getChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ViewOrAddMembersButton } from "@/components/feature/chat-header/ViewOrAddMembersButton"
import { EditChannelNameButton } from "../channel-details/rename-channel/EditChannelNameButton"
import { SearchButton } from "./SearchButton"

interface ChannelHeaderProps {
    channelData: ChannelListItem
}

export const ChannelHeader = ({ channelData }: ChannelHeaderProps) => {

    // The channel header has the channel name, the channel type icon, edit channel name button, and the view or add members button

    return (
        <PageHeader>
            <PageHeading>
                <HStack>
                    <Icon as={getChannelIcon(channelData.type)} />
                    <Text>{channelData.channel_name}</Text>
                    <EditChannelNameButton channelID={channelData.name} channel_name={channelData.channel_name} type={channelData.type} />
                </HStack>
            </PageHeading>
            <HStack>
                <SearchButton />
                <ViewOrAddMembersButton channelData={channelData} />
            </HStack>
        </PageHeader>
    )
}