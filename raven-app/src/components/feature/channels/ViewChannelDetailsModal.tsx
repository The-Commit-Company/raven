import { Text, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, HStack, Tabs, TabList, Tab, TabPanels, TabPanel, Icon } from "@chakra-ui/react"
import { useContext } from "react"
import { ChannelDetails } from "../channel-details/ChannelDetails"
import { ChannelMemberDetails } from "../channel-member-details/ChannelMemberDetails"
import { FilesSharedInChannel } from '../channel-shared-files/FilesSharedInChannel'
import { ChannelSettings } from "../channel-settings/ChannelSettings"
import { UserContext } from "../../../utils/auth/UserProvider"
import { getChannelIcon } from "@/utils/layout/channelIcon"
import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"

interface ViewChannelDetailsModalProps {
    isOpen: boolean,
    onClose: () => void,
    channelData: ChannelListItem,
    activeUsers: string[],
    channelMembers: ChannelMembers,
    updateMembers: () => void
}

export const ViewChannelDetailsModal = ({ isOpen, onClose, channelData, channelMembers, activeUsers, updateMembers }: ViewChannelDetailsModalProps) => {

    const memberCount = Object.keys(channelMembers).length
    const { currentUser } = useContext(UserContext)

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>

                <ModalHeader>
                    <HStack><Icon as={getChannelIcon(channelData.type)} /><Text>{channelData.channel_name}</Text></HStack>
                </ModalHeader>
                <ModalCloseButton mt='2' />

                <ModalBody>

                    <Tabs h='60vh' defaultIndex={1}>
                        <TabList>
                            <Tab>About</Tab>
                            <Tab>
                                <HStack>
                                    <Text>Members</Text>
                                    <Text>{memberCount}</Text>
                                </HStack>
                            </Tab>
                            <Tab>Files</Tab>
                            {/* channel settings are only available for admins */}
                            {/* the general channel is the default channel and cannot be deleted or archived */}
                            {channelMembers[currentUser]?.is_admin == 1 && channelData.name != 'general' && <Tab>Settings</Tab>}
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}>
                                <ChannelDetails channelData={channelData} channelMembers={channelMembers} onClose={onClose} />
                            </TabPanel>
                            <TabPanel px={0}>
                                <ChannelMemberDetails channelData={channelData} channelMembers={channelMembers} activeUsers={activeUsers} updateMembers={updateMembers} />
                            </TabPanel>
                            <TabPanel px={0}>
                                <FilesSharedInChannel channelMembers={channelMembers} />
                            </TabPanel>
                            <TabPanel px={0}>
                                <ChannelSettings channelData={channelData} onClose={onClose} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    <Text fontSize='xs' color='gray.500' pl='3' pb='4'>Channel ID: {channelData.name}</Text>

                </ModalBody>

            </ModalContent>
        </Modal>
    )
}