import { DateMonthYear, StandardDate } from "@/utils/dateConversions"
import { Box, Button, DropdownMenu, Flex, HoverCard, Inset, Table, Text, Tooltip } from "@radix-ui/themes"
import { FileInChannel } from "./ViewFilesContent"
import { UserAvatar } from "@/components/common/UserAvatar"
import { formatBytes } from "@/utils/operations"
import { BiDownload, BiLink, BiLinkExternal } from "react-icons/bi"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"
import useFileURLCopy from "@/hooks/useFileURLCopy"
import { useIsDesktop } from "@/hooks/useMediaQuery"

export const FilesTable = ({ data }: { data: FileInChannel[] }) => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return (
            <Table.Root variant="surface" className='overflow-scroll'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Preview</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Sent by</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Shared on</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data?.map((file: FileInChannel, index: number) => {
                        return (
                            <Table.Row key={file.name}>
                                <Table.Cell>
                                    {file.message_type === 'File' ?
                                        <FileExtensionIcon ext={file.file_type?.toLowerCase() ?? 'file'} style={{ paddingLeft: '4' }} />
                                        : <ImagePreview file={file} />}
                                </Table.Cell>
                                <Table.Cell>
                                    <Box className='relative' style={{ cursor: 'pointer', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger>
                                                <Text>
                                                    {file.file_name}
                                                </Text>
                                            </DropdownMenu.Trigger>
                                            <FileActionsMenu file={file.file_url} />
                                        </DropdownMenu.Root>
                                    </Box>
                                </Table.Cell>
                                <Table.Cell>{file.file_type ? file.file_type : 'File'}</Table.Cell>
                                <Table.Cell>{formatBytes(file.file_size)}</Table.Cell>
                                <Table.Cell>
                                    <Flex gap='2' align='center'>
                                        <UserAvatar src={file.user_image} alt={file.full_name} />
                                        {file.full_name ?? '-'}
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell><StandardDate date={file.creation} /></Table.Cell>
                                <Table.Cell>
                                    <FileButtons file={file.file_url} />
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table.Root>
        )
    } else {
        return <Flex direction='column' gap='3' className="overflow-scroll pb-4">
            {data?.map((file: FileInChannel) => <Flex key={file.name} align='center' justify='between' className="border-b border-gray-4 dark:border-gray-6`} pb-3">
                <Flex direction='column'>
                    <Flex gap='2' align='center'>
                        <Flex className="w-8 items-center justify-center">
                            {file.message_type === 'File' ?
                                <FileExtensionIcon ext={file.file_type?.toLowerCase() ?? 'file'} className="px-2" />
                                : <ImagePreview file={file} />}
                        </Flex>

                        <Box className='relative' style={{ cursor: 'pointer', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <Text size='2' as='span' className="text-ellipsis">
                                        {file.file_name}
                                    </Text>
                                </DropdownMenu.Trigger>
                                <FileActionsMenu file={file.file_url} />
                            </DropdownMenu.Root>
                            <Flex gap='2' align='center'>
                                <Text size='1' color='gray'>
                                    by {file.full_name ?? file.owner} on <DateMonthYear date={file.creation} />
                                </Text>
                            </Flex>
                        </Box>
                    </Flex>
                </Flex>
                <FileButtons file={file.file_url} />
            </Flex>
            )}
        </Flex>
    }


}

const ImagePreview = ({ file }: { file: FileInChannel }) => {

    return <HoverCard.Root>
        <HoverCard.Trigger>
            <img
                style={{ borderRadius: '4px' }}

                src={file.file_url} alt={file.file_name}
                className="object-cover w-8 h-8 sm:w-[25px] sm:h-[25px]" />
        </HoverCard.Trigger>
        <HoverCard.Content>
            <Inset side='all' mb='0' className="-mb-6">
                <img
                    src={file.file_thumbnail || file.file_url}
                    alt={file.file_name}
                    height={file.thumbnail_height || '200px'} width={file.thumbnail_width || '200px'} className="object-cover" />
            </Inset>
        </HoverCard.Content>
    </HoverCard.Root>
}

const FileButtons = ({ file }: { file: string }) => {

    const copy = useFileURLCopy(file)

    const isDesktop = useIsDesktop()

    return (
        <Flex gap='2'>
            <Tooltip content='Copy link'>
                <Button variant='soft' color='gray' size='1' onClick={copy}>
                    <BiLink size='16' />
                </Button>
            </Tooltip>
            <Tooltip content='Download'>
                <a download href={file}>
                    <Button variant='soft' color='gray' size='1'>
                        <BiDownload size='16' />
                    </Button>
                </a>
            </Tooltip>
            {isDesktop &&
                <Tooltip content='Open in new tab'>
                    <a href={file} target='_blank' rel='noreferrer'>
                        <Button variant='soft' color='gray' size='1'>
                            <BiLinkExternal size='14' />
                        </Button>
                    </a>
                </Tooltip>
            }
        </Flex>
    )
}

const FileActionsMenu = ({ file }: { file: string }) => {

    const copy = useFileURLCopy(file)

    return (
        <DropdownMenu.Content>
            <DropdownMenu.Item onClick={copy}>
                <Flex gap='2'>
                    <BiLink size='18' />
                    Copy link
                </Flex>
            </DropdownMenu.Item>

            <DropdownMenu.Item>
                <a download href={file}>
                    <Flex gap='2'>
                        <BiDownload size='18' />
                        Download
                    </Flex>
                </a>
            </DropdownMenu.Item>

            <DropdownMenu.Item>
                <a href={file} target='_blank' rel='noreferrer'>
                    <Flex gap='2'>
                        <BiLinkExternal size='16' />
                        Open in new tab
                    </Flex>
                </a>
            </DropdownMenu.Item>
        </DropdownMenu.Content>
    )
}