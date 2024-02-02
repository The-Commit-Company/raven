import { StandardDate } from "@/utils/dateConversions"
import { Flex, Table } from "@radix-ui/themes"
import { BsThreeDots } from "react-icons/bs"
import { FileInChannel } from "./ViewFilesContent"
import { UserAvatar } from "@/components/common/UserAvatar"
import { formatBytes } from "@/utils/operations"

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
                                <BsThreeDots />
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table.Root>
    )
}