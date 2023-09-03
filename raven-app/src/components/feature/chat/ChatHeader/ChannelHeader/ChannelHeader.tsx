import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { PageHeading } from "@/components/layout/Heading/PageHeading"
import { EditChannelNameButton } from "./EditChannelNameButton"
import { Text, HStack, Icon } from "@chakra-ui/react"
import { getChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ViewOrAddMembersButton } from "@/components/feature/view-or-add-members/ViewOrAddMembersButton"
import { ChannelMembers } from "@/pages/ChatSpace"

interface ChannelHeaderProps {
    channelData: ChannelListItem,
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ChannelHeader = ({ channelData, channelMembers, updateMembers }: ChannelHeaderProps) => {
    return (
        <PageHeader>
            <PageHeading>
                <HStack>
                    <Icon as={getChannelIcon(channelData.type)} />
                    <Text>{channelData.channel_name}</Text>
                    <EditChannelNameButton channelID={channelData.name} channel_name={channelData.channel_name} type={channelData.type} />
                </HStack>
            </PageHeading>
            {/* <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                <Button
                    size={"sm"}
                    aria-label="search"
                    leftIcon={<HiOutlineSearch />}
                    onClick={onCommandPaletteToggle}
                    fontWeight='light'>
                    Search
                </Button>
            </Tooltip> */}
            <ViewOrAddMembersButton channelData={channelData} channelMembers={channelMembers} updateMembers={updateMembers} />
        </PageHeader>
    )
}