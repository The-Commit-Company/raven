import { getFileExtensionIcon } from "../../../utils/layout/fileExtensionIcon";
import { useFrappeGetCall } from "frappe-react-sdk";
import { useParams } from "react-router-dom";
import { ErrorBanner } from "../../layout/AlertBanner";
import { DateObjectToFormattedDateString, getFileExtension, getFileName } from "../../../utils/operations";
import { BsDownload } from "react-icons/bs";
import { FileMessage } from "../../../../../types/Messaging/Message";
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider";
import { Box, Flex, IconButton, Link, Text } from "@radix-ui/themes";

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

    return (
        <Flex direction='column' gap='4' className={'h-96'}>
            {data?.message && data.message.length > 0 &&
                <Text weight='medium' size='2'>Recently shared files</Text>
            }
            <ErrorBanner error={error} />
            <Box className={'max-h-96 overflow-hidden overflow-y-scroll'}>
                <Flex direction='column' gap='2'>
                    {data?.message && data.message.length > 0 && data.message.map((f: FileMessage) => {
                        return (
                            <Box key={f.name} className={'p-2 rounded-md border border-gray-600'}>
                                <Flex justify='between' align={'center'}>
                                    <Flex gap='3'>
                                        <Box>
                                            {f.message_type === 'File' && <div>{getFileExtensionIcon(getFileExtension(f.file))}</div>}
                                            {f.message_type === 'Image' && <img src={f.file} alt='File preview' className={'h-8 w-8 rounded-md object-cover'} />}
                                        </Box>
                                        <Flex direction='column' gap='0'>
                                            <Link size='1' href={f.file} target='_blank' aria-label='download file'>{getFileName(f.file)}</Link>
                                            <Text size='1' color='gray'>Shared by {channelMembers[f.owner]?.full_name} on {DateObjectToFormattedDateString(new Date(f.creation ?? ''))}</Text>
                                        </Flex>
                                    </Flex>
                                    <Link href={f.file} target='_blank' aria-label='download file'>
                                        <IconButton
                                            aria-label="download file"
                                            size='1'
                                            color='gray'
                                            variant='soft'>
                                            <BsDownload fontSize={'0.7rem'} />
                                        </IconButton>
                                    </Link>
                                </Flex>
                            </Box>
                        )
                    })}
                </Flex>
            </Box>
            {data?.message && data.message.length === 0 &&
                <Flex align={'center'}>
                    <Text size='1' color='gray' className={'text-center'}>
                        No files have been shared in this channel yet. Drag and drop any files into the message pane to add them to this conversation.
                    </Text>
                </Flex>}
        </Flex>
    )
}