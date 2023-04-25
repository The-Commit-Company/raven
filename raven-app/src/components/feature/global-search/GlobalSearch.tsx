import { Button, CloseButton, Flex, HStack, Select, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { useFrappeGetCall } from "frappe-react-sdk"
import { useNavigate } from "react-router-dom"
import { EmptyStateForSearch } from "../../layout/EmptyState/EmptyState"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { PageHeading } from "../../layout/Heading/PageHeading"

type Props = {}

export default function GlobalSearch({ }: Props) {
    const { onToggle: onToggleOtherChannels, isOpen: isOpenOtherChannels } = useDisclosure()
    const { onToggle: onToggleMyChannels, isOpen: isOpenMyChannels } = useDisclosure()
    const navigate = useNavigate()

    const handleClose = () => {
        navigate(-1)
    }

    const { data, error, mutate } = useFrappeGetCall("raven.api.search.get_search_result", {
        doctype: 'Raven Message',
        // search_text: 'yo',
        // from_user: ,
        // in_channel:,
        // date:,
        // file_type:,
        // channel_type:,
        // my_channel_only:,
        // other_channel_only:,
    })

    console.log(data)
    return (
        <><PageHeader>
            <PageHeading>
                Search Results
            </PageHeading>
            <CloseButton onClick={handleClose} />
        </PageHeader>
            <Stack mt={16}>
                <Tabs h='60vh' defaultIndex={1}>
                    <TabList>
                        <Tab>Messages</Tab>
                        <Tab>Files</Tab>
                        <Tab>Channels</Tab>
                        <Tab>People</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel px={0}>
                            <HStack pl={4}>
                                <Select placeholder="From" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Select placeholder="In" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Select placeholder="With" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Select placeholder="Date" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Button onClick={onToggleMyChannels} isActive={isOpenMyChannels} size='sm' w="9rem">Only my channels</Button>
                                <Button variant="link" size='sm' >More filters</Button>
                            </HStack>
                            <EmptyStateForSearch />
                        </TabPanel>
                        <TabPanel px={0}>
                            <HStack pl={4}>
                                <Select placeholder="From" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Select placeholder="In" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Select placeholder="Date" size='sm' w="5rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Select placeholder="File type" size='sm' w="7rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Button onClick={onToggleMyChannels} isActive={isOpenMyChannels} size='sm' w="9rem">Only my channels</Button>
                                <Button variant="link" size='sm' >More filters</Button>
                            </HStack>
                            <EmptyStateForSearch />
                        </TabPanel>
                        <TabPanel px={0}>
                            <HStack pl={4}>
                                <Select placeholder="Channel type" size='sm' w="9rem">
                                    <option value="any">Any channel type</option>
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="open">Open</option>
                                </Select>
                                <Button onClick={onToggleOtherChannels} isActive={isOpenOtherChannels} size='sm' w="15rem">Exclude the channels that I'm in</Button>
                                <Button onClick={onToggleMyChannels} isActive={isOpenMyChannels} size='sm' w="9rem">Only my channels</Button>
                            </HStack>
                            <EmptyStateForSearch />
                        </TabPanel>
                        <TabPanel px={0}>
                            <EmptyStateForSearch />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Stack>
        </>
    )
}