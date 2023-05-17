import { Text, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, HStack, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"
import { useContext } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { ChannelDetails } from "../channel-details/ChannelDetails"
import { ChannelMemberDetails } from "../channel-details/ChannelMemberDetails"
import { FilesSharedInChannel } from '../files/FilesSharedInChannel'
import { ChannelSettings } from "../settings/ChannelSettings"
import { UserContext } from "../../../utils/auth/UserProvider"

interface ViewChannelDetailsModalProps {
    isOpen: boolean,
    onClose: () => void,
    activeUsers: string[]
}

export const ViewChannelDetailsModal = ({ isOpen, onClose, activeUsers }: ViewChannelDetailsModalProps) => {

    const { channelMembers, channelData } = useContext(ChannelContext)
    const members = Object.values(channelMembers)
    const memberCount = members.length
    const { currentUser } = useContext(UserContext)

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>

                <ModalHeader>
                    {channelData?.type === 'Public' && <HStack><BiHash /><Text>{channelData?.channel_name}</Text></HStack> ||
                        channelData?.type === 'Private' && <HStack><BiLockAlt /><Text>{channelData?.channel_name}</Text></HStack> ||
                        channelData?.type === 'Open' && <HStack><BiGlobe /><Text>{channelData?.channel_name}</Text></HStack>
                    }
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
                            {channelData?.owner === currentUser && channelData?.name != 'general' && <Tab>Settings</Tab>}
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}>
                                <ChannelDetails />
                            </TabPanel>
                            <TabPanel px={0}>
                                <ChannelMemberDetails members={members} activeUsers={activeUsers} />
                            </TabPanel>
                            <TabPanel px={0}>
                                <FilesSharedInChannel />
                            </TabPanel>
                            {channelData?.name != 'general' && <TabPanel px={0}>
                                <ChannelSettings onClose={onClose} />
                            </TabPanel>}
                        </TabPanels>
                    </Tabs>

                    <Text fontSize='xs' color='gray.500' pl='3' pb='4'>Channel ID: {channelData?.name}</Text>

                </ModalBody>

            </ModalContent>
        </Modal>
    )
}