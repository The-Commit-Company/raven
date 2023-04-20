import { Box, Button, CloseButton, Flex, HStack, Select, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
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
                            <Flex justify="center" align="center" height="70vh" width="full">
                                <VStack>
                                    <Text fontWeight="bold" align="center">Nothing turned up</Text>
                                    <Text align="center" w="30vw">You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                                </VStack>
                            </Flex>
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
                            <Flex justify="center" align="center" height="70vh" width="full">
                                <VStack>
                                    <Text fontWeight="bold" align="center">Nothing turned up</Text>
                                    <Text align="center" w="30vw">You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                                </VStack>
                            </Flex>
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
                            <Flex justify="center" align="center" height="70vh" width="full">
                                <VStack>
                                    <Text fontWeight="bold" align="center">Nothing turned up</Text>
                                    <Text align="center" w="30vw">You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                                </VStack>
                            </Flex>
                        </TabPanel>
                        <TabPanel px={0}>
                            <Flex justify="center" align="center" height="70vh" width="full">
                                <VStack>
                                    <Text fontWeight="bold" align="center">Nothing turned up</Text>
                                    <Text align="center" w="30vw">You may want to try using different keywords, checking for typos or adjusting your filters.</Text>
                                </VStack>
                            </Flex>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Stack>
        </>
    )
}