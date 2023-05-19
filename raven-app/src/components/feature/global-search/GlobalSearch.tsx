import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, Stack, Tab, TabList, TabPanels, Tabs, useDisclosure } from "@chakra-ui/react"
import { SelectOption } from "../search-filters/SelectInput"
import { ChannelSearch } from "./ChannelSearch"
import { FileSearch } from "./FileSearch"
import { MessageSearch } from "./MessageSearch"

interface GlobalSearchModalProps {
    isOpen: boolean,
    onClose: () => void,
    tabIndex: number,
    input: string,
    fromFilter?: string,
    inFilter?: string,
}

export default function GlobalSearch({ isOpen, onClose, tabIndex, input, fromFilter, inFilter }: GlobalSearchModalProps) {

    const { onToggle: onToggleOtherChannels, isOpen: isOpenOtherChannels } = useDisclosure()
    const { onToggle: onToggleMyChannels, isOpen: isOpenMyChannels } = useDisclosure()

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
            <ModalContent>
                <ModalHeader>
                    Search Results
                    <ModalCloseButton mt='2' />
                </ModalHeader>
                <ModalBody>
                    <Stack>
                        <Tabs defaultIndex={tabIndex}>
                            <TabList>
                                <Tab>Messages</Tab>
                                <Tab>Files</Tab>
                                <Tab>Channels</Tab>
                            </TabList>
                            <TabPanels>
                                <MessageSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} dateOption={dateOption} input={input} fromFilter={fromFilter} inFilter={inFilter} />
                                <FileSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} dateOption={dateOption} input={input} fromFilter={fromFilter} inFilter={inFilter} />
                                <ChannelSearch onToggleMyChannels={onToggleMyChannels} isOpenMyChannels={isOpenMyChannels} onToggleOtherChannels={onToggleOtherChannels} isOpenOtherChannels={isOpenOtherChannels} input={input} onClose={onClose} />
                            </TabPanels>
                        </Tabs>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export const dateOption: SelectOption[] = [
    { label: "Today", value: getDateString(0) },
    { label: "Yesterday", value: getDateString(-1) },
    { label: "Last 7 days", value: getDateString(-6) },
    { label: "Last 30 days", value: getDateString(-29) },
    { label: "Last three months", value: getDateString(-89) },
    { label: "Last 12 months", value: getDateString(-364) }
]

function getDateString(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day} 00:00:00`;
}