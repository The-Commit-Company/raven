import { useContext } from "react"
import { ChannelDetails } from "../channel-details/ChannelDetails"
import { ChannelMemberDetails } from "../channel-member-details/ChannelMemberDetails"
import { FilesSharedInChannel } from '../channel-shared-files/FilesSharedInChannel'
import { ChannelSettings } from "../channel-settings/ChannelSettings"
import { UserContext } from "../../../utils/auth/UserProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { Box, Dialog, Flex, Tabs, Text } from "@radix-ui/themes"
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog"

interface ViewChannelDetailsModalContentProps {
    onClose: () => void,
    channelData: ChannelListItem,
    activeUsers: string[],
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ViewChannelDetailsModalContent = ({ onClose, channelData, channelMembers, activeUsers, updateMembers }: ViewChannelDetailsModalContentProps) => {

    const memberCount = Object.keys(channelMembers).length
    const { currentUser } = useContext(UserContext)
    const type = channelData.type

    return (
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
            <Dialog.Title>
                <Flex align='center' gap='2'>
                    <ChannelIcon className={'mt-1'} type={type} />
                    <Text>{channelData.channel_name}</Text>
                </Flex>
            </Dialog.Title>

            <Tabs.Root defaultValue="Members">
                <Flex direction={'column'} gap='4'>
                    <Tabs.List>
                        <Tabs.Trigger value="About">About</Tabs.Trigger>
                        <Tabs.Trigger value="Members">
                            <Flex gap='2'>
                                <Text>Members</Text>
                                <Text>{memberCount}</Text>
                            </Flex>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="Files">Files</Tabs.Trigger>
                        {/* channel settings are only available for admins */}
                        {/* the general channel is the default channel and cannot be deleted or archived */}
                        {channelMembers[currentUser]?.is_admin == 1 && channelData.name != 'general' && channelData.is_archived == 0 && <Tabs.Trigger value="Settings">Settings</Tabs.Trigger>}
                    </Tabs.List>
                    <Box>
                        <Tabs.Content value="About">
                            <ChannelDetails channelData={channelData} channelMembers={channelMembers} onClose={onClose} />
                        </Tabs.Content>
                        <Tabs.Content value="Members">
                            <ChannelMemberDetails channelData={channelData} channelMembers={channelMembers} activeUsers={activeUsers} updateMembers={updateMembers} />
                        </Tabs.Content>
                        <Tabs.Content value="Files">
                            <FilesSharedInChannel channelMembers={channelMembers} />
                        </Tabs.Content>
                        <Tabs.Content value="Settings">
                            <ChannelSettings channelData={channelData} onClose={onClose} />
                        </Tabs.Content>
                    </Box>
                </Flex>
            </Tabs.Root>
        </Dialog.Content>
    )
}