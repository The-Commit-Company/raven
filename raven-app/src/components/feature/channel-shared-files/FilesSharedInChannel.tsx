import { Text, HStack, Icon, Stack, Link, Box, IconButton, Center, Image, useDisclosure, Flex } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon";
import { useFrappeGetCall } from "frappe-react-sdk";
import { useParams } from "react-router-dom";
import { ErrorBanner } from "../../layout/AlertBanner";
import { DateObjectToFormattedDateString, getFileExtension, getFileName } from "../../../utils/operations";
import { BsDownload } from "react-icons/bs";
import { FileMessage } from "../../../../../types/Messaging/Message";
import { scrollbarStyles } from "../../../styles";
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider";
import { useTheme } from "@/ThemeProvider";

interface ChannelFile extends FileMessage {
    name: string,
    owner: string,
}

interface FilesSharedInChannelProps {
    channelMembers: ChannelMembers
}

export const FilesSharedInChannel = ({ channelMembers }: FilesSharedInChannelProps) => {

    const { channelID } = useParams()
    const { data, error } = useFrappeGetCall<{ message: ChannelFile[] }>("raven.raven_messaging.doctype.raven_message.raven_message.fetch_recent_files", {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })
    const { isOpen: isGlobalSearchModalOpen, onOpen: onGlobalSearchModalOpen, onClose: onGlobalSearchModalClose } = useDisclosure()

    const { appearance } = useTheme()
    const BOXSTYLE = {
        p: '4',
        rounded: 'md',
        border: '1px solid',
        borderColor: appearance === 'light' ? 'gray.200' : 'gray.600'
    }

    return (
        <Stack spacing={4}>
            {data?.message && data.message.length > 0 &&
                <Text fontWeight={'semibold'} fontSize={'sm'}>Recently shared files</Text>
            }
            <ErrorBanner error={error} />
            <Box maxH='320px' overflow='hidden' overflowY='scroll' sx={scrollbarStyles(appearance)}>
                <Stack>
                    {data?.message && data.message.length > 0 && data.message.map((f: FileMessage) => {
                        return (
                            <Box {...BOXSTYLE} key={f.name}>
                                <HStack justifyContent='space-between'>
                                    <HStack spacing={3}>
                                        <Center maxW='50px'>
                                            {f.message_type === 'File' && <Icon as={getFileExtensionIcon(getFileExtension(f.file))} boxSize="9" />}
                                            {f.message_type === 'Image' && <Image src={f.file} alt='File preview' boxSize={'36px'} rounded='md' fit='cover' />}
                                        </Center>
                                        <Stack spacing={0}>
                                            <Text fontSize='sm' as={Link} href={f.file} isExternal>{getFileName(f.file)}</Text>
                                            <Text fontSize='xs' color='gray.500'>Shared by {channelMembers[f.owner]?.full_name} on {DateObjectToFormattedDateString(new Date(f.creation ?? ''))}</Text>
                                        </Stack>
                                    </HStack>
                                    <IconButton
                                        as={Link}
                                        href={f.file}
                                        isExternal
                                        aria-label="download file"
                                        size='xs'
                                        variant='ghost'
                                        icon={<Icon as={BsDownload} />} />
                                </HStack>
                            </Box>
                        )
                    })}
                </Stack>
            </Box>
            {data?.message && data.message.length === 0 &&
                <Flex>
                    <Text fontSize='sm' color='gray.500' textAlign={'center'}>
                        No files have been shared in this channel yet. Drag and drop any file into the message pane to add it to this conversation.
                    </Text>
                </Flex>}
            {/* {data?.message && data.message.length > 0 &&
                <Button
                    width={'fit-content'}
                    variant='link'
                    onClick={onGlobalSearchModalOpen}
                    color='blue.500'
                    size={'sm'}>
                    Show more
                </Button>
            }
            <GlobalSearch isOpen={isGlobalSearchModalOpen} onClose={onGlobalSearchModalClose} tabIndex={1} input={""} /> */}
        </Stack>
    )
}