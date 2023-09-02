import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { PageHeading } from "@/components/layout/Heading/PageHeading"
import { EditChannelNameButton } from "./EditChannelNameButton"
import { Text, HStack, Icon } from "@chakra-ui/react"
import { getChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"

interface ChannelHeaderProps {
    channelID: string,
    channel_name: string
    type: ChannelListItem['type']
}

export const ChannelHeader = ({ channelID, channel_name, type }: ChannelHeaderProps) => {
    return (
        <PageHeader>
            <PageHeading>
                <HStack>
                    <HStack><Icon as={getChannelIcon(type)} /><Text>{channel_name}</Text></HStack>
                    <EditChannelNameButton channelID={channelID} channel_name={channel_name} type={type} />
                </HStack>
                {/* <HStack>
                    <Tooltip hasArrow label='search' placement='bottom-start' rounded={'md'}>
                        <Button
                            size={"sm"}
                            aria-label="search"
                            leftIcon={<HiOutlineSearch />}
                            onClick={onCommandPaletteToggle}
                            fontWeight='light'>
                            Search
                        </Button>
                    </Tooltip>
                    <ViewOrAddMembersButton onClickViewMembers={onViewDetailsModalOpen} onClickAddMembers={onAddMemberModalOpen} activeUsers={activeUsers.message} />
                </HStack> */}
            </PageHeading>
        </PageHeader>
    )
}