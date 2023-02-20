import { Text, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, HStack, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"
import { useContext } from "react"
import { BiHash, BiLockAlt } from "react-icons/bi"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { ChannelDetails } from "../channel-details/ChannelDetails"
import { ChannelMemberDetails } from "../channel-details/ChannelMemberDetails"

interface ViewChannelDetailsModalProps {
    isOpen: boolean,
    onClose: () => void,
    channel_name: string,
    type: string,
}

export const ViewChannelDetailsModal = ({ isOpen, onClose, channel_name, type }: ViewChannelDetailsModalProps) => {

    const { channelMembers } = useContext(ChannelContext)
    const members = Object.values(channelMembers)
    const memberCount = members.length

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>

                <ModalHeader>
                    {type === 'Public'
                        ?
                        <HStack><BiHash /><Text>{channel_name}</Text></HStack>
                        :
                        <HStack><BiLockAlt /><Text>{channel_name}</Text></HStack>
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
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}>
                                <ChannelDetails />
                            </TabPanel>
                            <TabPanel px={0}>
                                <ChannelMemberDetails members={members} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                </ModalBody>

            </ModalContent>
        </Modal>
    )
}