import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, Stack, Tab, TabList, TabPanels, Tabs, useDisclosure } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { ChannelSearch } from "./ChannelSearch"
import { FileSearch } from "./FileSearch"
import { MessageSearch } from "./MessageSearch"
import { PeopleSearch } from "./PeopleSearch"

interface GlobalSearchModalProps {
    isOpen: boolean,
    onClose: () => void,
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchModalProps) {
    const { onToggle: onToggleOtherChannels, isOpen: isOpenOtherChannels } = useDisclosure()
    const { onToggle: onToggleMyChannels, isOpen: isOpenMyChannels } = useDisclosure()

    // const { data, error, mutate } = useFrappeGetCall("raven.api.search.get_search_result", {
    //     doctype: 'Raven Message',
    //     search_text: 'yo',
    //     from_user: ,
    //     in_channel:,
    //     date:,
    //     file_type:,
    //     channel_type:,
    //     my_channel_only:,
    //     other_channel_only:,
    // })

    // console.log(data)
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
            <ModalContent>
                <ModalHeader>
                    Search Results
                    <ModalCloseButton mt='2' />
                </ModalHeader>
                <ModalBody>
                    <Stack>
                        <Tabs defaultIndex={1}>
                            <TabList>
                                <Tab>Messages</Tab>
                                <Tab>Files</Tab>
                                <Tab>Channels</Tab>
                                <Tab>People</Tab>
                            </TabList>
                            <TabPanels>
                                <MessageSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} />
                                <FileSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} />
                                <ChannelSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} onToggleOtherChannels={onToggleOtherChannels} isOpenOtherChannels={isOpenOtherChannels} />
                                <PeopleSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} />
                            </TabPanels>
                        </Tabs>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}