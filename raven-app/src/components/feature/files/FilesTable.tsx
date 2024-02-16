import { StandardDate } from "@/utils/dateConversions"
import { Box, Button, DropdownMenu, Flex, Table, Text, Tooltip } from "@radix-ui/themes"
import { FileInChannel } from "./ViewFilesContent"
import { UserAvatar } from "@/components/common/UserAvatar"
import { formatBytes } from "@/utils/operations"
import { useToast } from "@/hooks/useToast"
import { BiDownload, BiLink, BiLinkExternal } from "react-icons/bi"
import { FileExtensionIcon } from "@/utils/layout/FileExtIcon"

export const FilesTable = ({ data }: { data: FileInChannel[] }) => {

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
                        <Table.Row key={index}>
                            <Table.Cell>
                                {file.message_type === 'File' ?
                                    <FileExtensionIcon ext={file.file_type.toLowerCase()} style={{ paddingLeft: '4' }} />
                                    : <img style={{ borderRadius: '4px' }} src={file.file_url} alt={file.file_name} height={'25px'} width={'25px'} />}
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
                            <Table.Cell>{file.file_type}</Table.Cell>
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
}

const FileButtons = ({ file }: { file: string }) => {

    const { toast } = useToast()
    const copy = () => {
        if (file.startsWith('http') || file.startsWith('https')) {
            navigator.clipboard.writeText(file)
        }
        else {
            navigator.clipboard.writeText(window.location.origin + file)
        }
        toast({
            title: 'Link copied',
            duration: 800,
            variant: 'accent'
        })
    }

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
            <Tooltip content='Open in new tab'>
                <a href={file} target='_blank' rel='noreferrer'>
                    <Button variant='soft' color='gray' size='1'>
                        <BiLinkExternal size='14' />
                    </Button>
                </a>
            </Tooltip>
        </Flex>
    )
}

const FileActionsMenu = ({ file }: { file: string }) => {

    const { toast } = useToast()
    const copy = () => {
        if (file.startsWith('http') || file.startsWith('https')) {
            navigator.clipboard.writeText(file)
        }
        else {
            navigator.clipboard.writeText(window.location.origin + file)
        }
        toast({
            title: 'Link copied',
            duration: 800,
            variant: 'accent'
        })
    }

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