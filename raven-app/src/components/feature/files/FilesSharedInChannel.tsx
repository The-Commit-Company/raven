import { Text, HStack, Icon, Stack, Link, Box, useColorMode, IconButton, Center, Image } from "@chakra-ui/react"
import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon";
import { useFrappeGetCall } from "frappe-react-sdk";
import { useParams } from "react-router-dom";
import { AlertBanner } from "../../layout/AlertBanner";
import { DateObjectToFormattedDateString } from "../../../utils/operations";
import { useContext } from "react";
import { ChannelContext } from "../../../utils/channel/ChannelProvider";
import { BsDownload } from "react-icons/bs";

type ChannelFile = {
    name: string,
    file: string,
    owner: string,
    creation: string,
    message_type: 'File' | 'Image'
}

export const FilesSharedInChannel = () => {

    const { channelID } = useParams()
    const { channelMembers } = useContext(ChannelContext)
    const { data, error } = useFrappeGetCall<{ message: ChannelFile[] }>("raven.raven_messaging.doctype.raven_message.raven_message.fetch_recent_files", {
        channel_id: channelID
    })

    const { colorMode } = useColorMode()
    const BOXSTYLE = {
        p: '4',
        rounded: 'md',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.200' : 'gray.600'
    }

    return (
        <Stack>
            <Text fontWeight={'semibold'} fontSize={'sm'}>Recent shared files</Text>
            {error && <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>}
            <Box maxH='400px' overflow='hidden' overflowY='scroll'>
                <Stack>
                    {data?.message && data.message.length > 0 && data.message.map((f) => {
                        return (
                            <Box {...BOXSTYLE}>
                                <HStack justifyContent='space-between'>
                                    <HStack spacing={3}>
                                        <Center maxW='50px'>
                                            {f.message_type === 'File' && <Icon as={getFileExtensionIcon(f.file.split('.')[1])} boxSize="6" />}
                                            {f.message_type === 'Image' && <Image src={f.file} alt='File preview' boxSize={'36px'} rounded='md' fit='cover' />}
                                        </Center>
                                        <Stack spacing={0}>
                                            <Text fontSize='sm' as={Link} href={f.file} isExternal>{f.file.split('/')[3]}</Text>
                                            <Text fontSize='xs' color='gray.500'>Shared by {channelMembers[f.owner].full_name} on {DateObjectToFormattedDateString(new Date(f.creation ?? ''))}</Text>
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
        </Stack>
    )
}