import { StandardDate } from "@/utils/dateConversions"
import { Box, Button, DropdownMenu, Flex, Table } from "@radix-ui/themes"
import { BsThreeDots } from "react-icons/bs"
import { FileInChannel } from "./ViewFilesContent"
import { UserAvatar } from "@/components/common/UserAvatar"
import { formatBytes } from "@/utils/operations"
import { useToast } from "@/hooks/useToast"
import { BiDownload, BiExit, BiLink } from "react-icons/bi"

export const FilesTable = ({ data }: { data: FileInChannel[] }) => {
    return (
        <Table.Root variant="surface">
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
                                <img src={file.file_url} alt={file.file_name} height={'35px'} width={'35px'} />
                            </Table.Cell>
                            <Table.Cell style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.file_name}
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
                                <Box className='relative'>
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger>
                                            <Button variant="soft" color="gray" size={'1'}>
                                                <BsThreeDots />
                                            </Button>
                                        </DropdownMenu.Trigger>
                                        <FileActionsMenu file={file.file_url} />
                                    </DropdownMenu.Root>
                                </Box>
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table.Root>
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
                        <BiExit size='18' />
                        Open in new tab
                    </Flex>
                </a>
            </DropdownMenu.Item>
        </DropdownMenu.Content>
    )
}